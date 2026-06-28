import supabase from "./supabase";

/**
 * Production-ready API Wrapper for the PYQ Database Module
 * Uses standard supabase-js client to query pyq_questions and auxiliary tables.
 */

// Helper to validate and get current authenticated user
async function getActiveUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error("Authentication check failed:", error);
    return null;
  }
  return user;
}

export const pyqApi = {
  /**
   * Fetch questions with advanced filters and pagination
   */
  async fetchQuestions({
    exam,
    subject,
    topic,
    difficulty,
    year,
    language,
    questionType,
    page = 1,
    limit = 10
  } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("pyq_questions")
        .select("*", { count: "exact" });

      if (exam) query = query.eq("exam", exam);
      if (subject) query = query.eq("subject", subject);
      if (topic) query = query.eq("topic", topic);
      if (difficulty) query = query.eq("difficulty", difficulty);
      if (year) query = query.eq("year", year);
      if (language) query = query.eq("language", language);
      if (questionType) query = query.eq("question_type", questionType);

      const { data, count, error } = await query
        .order("id", { ascending: true })
        .range(from, to);

      if (error) throw error;
      return { data, total: count || 0 };
    } catch (err) {
      console.error("fetchQuestions API Error:", err);
      return { data: [], total: 0 };
    }
  },

  /**
   * Instant search using PostgreSQL text indexing
   */
  async searchQuestions(searchQuery, { exam, subject, page = 1, limit = 10 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("pyq_questions")
        .select("*", { count: "exact" });

      if (searchQuery) {
        // Fallback to simple ILIKE for query safety, or full text search if available
        query = query.or(
          `question.ilike.%${searchQuery}%,topic.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,exam.ilike.%${searchQuery}%`
        );
      }

      if (exam) query = query.eq("exam", exam);
      if (subject) query = query.eq("subject", subject);

      const { data, count, error } = await query
        .order("id", { ascending: true })
        .range(from, to);

      if (error) throw error;
      return { data, total: count || 0 };
    } catch (err) {
      console.error("searchQuestions API Error:", err);
      return { data: [], total: 0 };
    }
  },

  /**
   * Toggle bookmark/favorite status
   */
  async toggleBookmark(questionId, isFavorite = false) {
    try {
      const user = await getActiveUser();
      if (!user) throw new Error("Unauthorized");

      // Check if bookmark exists
      const { data: existing } = await supabase
        .from("pyq_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();

      if (existing) {
        // Delete if already bookmarked with same favorite status
        if (existing.is_favorite === isFavorite) {
          const { error } = await supabase
            .from("pyq_bookmarks")
            .delete()
            .eq("user_id", user.id)
            .eq("question_id", questionId);
          if (error) throw error;
          return { bookmarked: false, isFavorite: false };
        } else {
          // Update favorite status
          const { error } = await supabase
            .from("pyq_bookmarks")
            .update({ is_favorite: isFavorite })
            .eq("user_id", user.id)
            .eq("question_id", questionId);
          if (error) throw error;
          return { bookmarked: true, isFavorite };
        }
      } else {
        // Insert new bookmark
        const { error } = await supabase
          .from("pyq_bookmarks")
          .insert({
            user_id: user.id,
            question_id: questionId,
            is_favorite: isFavorite
          });
        if (error) throw error;
        return { bookmarked: true, isFavorite };
      }
    } catch (err) {
      console.error("toggleBookmark API Error:", err);
      return null;
    }
  },

  /**
   * Fetch all user bookmarked questions
   */
  async getBookmarkedQuestions() {
    try {
      const user = await getActiveUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("pyq_bookmarks")
        .select("is_favorite, pyq_questions(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(item => ({
        ...item.pyq_questions,
        is_favorite: item.is_favorite,
        bookmarked: true
      }));
    } catch (err) {
      console.error("getBookmarkedQuestions API Error:", err);
      return [];
    }
  },

  /**
   * Save personal user notes
   */
  async saveNote(questionId, noteText) {
    try {
      const user = await getActiveUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from("pyq_notes")
        .upsert({
          user_id: user.id,
          question_id: questionId,
          note_text: noteText,
          updated_at: new Date()
        }, { onConflict: "user_id,question_id" })
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("saveNote API Error:", err);
      return null;
    }
  },

  /**
   * Fetch note for a specific question
   */
  async getNote(questionId) {
    try {
      const user = await getActiveUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("pyq_notes")
        .select("note_text")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();

      if (error) throw error;
      return data ? data.note_text : "";
    } catch (err) {
      console.error("getNote API Error:", err);
      return "";
    }
  },

  /**
   * Submit quiz/question practice attempt for analytics tracking
   */
  async saveAttempt(questionId, selectedOption, isCorrect, timeTakenSeconds = 0) {
    try {
      const user = await getActiveUser();
      if (!user) return null;

      const { error } = await supabase
        .from("pyq_attempts")
        .insert({
          user_id: user.id,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: isCorrect,
          time_taken_seconds: timeTakenSeconds
        });

      if (error) throw error;

      // Increment attempt count on question in background
      await supabase.rpc("increment_question_attempts", { q_id: questionId, is_corr: isCorrect });

      return true;
    } catch (err) {
      console.error("saveAttempt API Error:", err);
      return false;
    }
  },

  /**
   * Generate custom practice mock tests
   */
  async generateMockTest({ exam, subject, topic, difficulty, count = 10 } = {}) {
    try {
      let query = supabase
        .from("pyq_questions")
        .select("*");

      if (exam) query = query.eq("exam", exam);
      if (subject) query = query.eq("subject", subject);
      if (topic) query = query.eq("topic", topic);
      if (difficulty) query = query.eq("difficulty", difficulty);

      const { data, error } = await query;
      if (error) throw error;

      // Client-side random sample
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (err) {
      console.error("generateMockTest API Error:", err);
      return [];
    }
  },

  /**
   * Error Reporting
   */
  async reportError(questionId, reportType, description) {
    try {
      const user = await getActiveUser();
      const { error } = await supabase
        .from("pyq_reports")
        .insert({
          user_id: user ? user.id : null,
          question_id: questionId,
          report_type: reportType,
          description: description
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("reportError API Error:", err);
      return false;
    }
  },

  /**
   * Fetch User Progress & Performance Analytics
   */
  async getAnalytics() {
    try {
      const user = await getActiveUser();
      if (!user) return null;

      const { data: attempts, error } = await supabase
        .from("pyq_attempts")
        .select("is_correct, time_taken_seconds, created_at, pyq_questions(subject, topic)")
        .eq("user_id", user.id);

      if (error) throw error;

      const totalAttempts = attempts.length;
      if (totalAttempts === 0) return { totalAttempts: 0, accuracy: 0, avgTime: 0, subjectStats: {} };

      const correctAttempts = attempts.filter(a => a.is_correct).length;
      const accuracy = ((correctAttempts / totalAttempts) * 100).toFixed(1);
      const totalTime = attempts.reduce((acc, a) => acc + (a.time_taken_seconds || 0), 0);
      const avgTime = (totalTime / totalAttempts).toFixed(1);

      // Subject breakdown
      const subjectStats = {};
      attempts.forEach(a => {
        const subj = a.pyq_questions?.subject || "Unknown";
        if (!subjectStats[subj]) {
          subjectStats[subj] = { total: 0, correct: 0 };
        }
        subjectStats[subj].total += 1;
        if (a.is_correct) subjectStats[subj].correct += 1;
      });

      return {
        totalAttempts,
        accuracy,
        avgTime,
        subjectStats
      };
    } catch (err) {
      console.error("getAnalytics API Error:", err);
      return null;
    }
  },

  /**
   * Admin Panel mutations
   */
  async adminCreateQuestion(questionData) {
    try {
      const { data, error } = await supabase
        .from("pyq_questions")
        .insert([questionData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("adminCreateQuestion API Error:", err);
      throw err;
    }
  },

  async adminUpdateQuestion(questionId, questionData) {
    try {
      const { data, error } = await supabase
        .from("pyq_questions")
        .update(questionData)
        .eq("id", questionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("adminUpdateQuestion API Error:", err);
      throw err;
    }
  },

  async adminDeleteQuestion(questionId) {
    try {
      const { error } = await supabase
        .from("pyq_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("adminDeleteQuestion API Error:", err);
      throw err;
    }
  }
};
