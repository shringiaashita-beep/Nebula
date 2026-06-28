import React from 'react';

function SummaryPage() {
  return (
    <div className="arc-card p-6 md:p-10 mt-8 max-w-5xl mx-auto animate-fade-in relative overflow-hidden" style={{ minHeight: "80vh" }}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <h1 className="arc-font-display text-4xl md:text-5xl font-black arc-text-gradient tracking-tight">
            What is Nebula?
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
            Nebula is your ultimate AI-powered Study Command Center, designed to transform the way you learn, practice, and track your progress.
          </p>
        </div>

        {/* How it Works Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold arc-font-display text-center" style={{ color: "var(--arc-text-hero)" }}>
            🚀 How It Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            
            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">📚</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>Topic Academy</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Organize your subjects into specific topics. Let our advanced AI generate comprehensive study notes, structured beautifully to help you grasp core concepts faster.
              </p>
            </div>

            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">🧠</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>Visual Mind Maps</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Don't just read—visualize! Instantly generate colorful, floating mind maps to break down complex topics into easily memorable chunks.
              </p>
            </div>

            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">🎴</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>Smart Flashcards</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Test your memory with auto-generated flashcards. Nebula extracts the most vital points from any topic to create quick revision decks.
              </p>
            </div>

            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">🎯</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>Elite Challenges</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Generate highly difficult MCQs for any topic. Test your deep conceptual understanding and earn XP and Badges for conquering them.
              </p>
            </div>

            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">📝</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>PYQ Hub</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Access a massive database of Previous Year Questions. Practice freely without needing an API key. Track your accuracy and master real exam patterns.
              </p>
            </div>

            <div className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">🌐</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--arc-gold-400)" }}>Multilingual Support</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Study in the language you are most comfortable with. Nebula seamlessly switches between English, Hindi, and Hinglish for both the UI and AI content.
              </p>
            </div>

          </div>
        </div>

        {/* Why it is useful */}
        <div className="p-8 rounded-3xl border mt-10 shadow-lg" style={{ background: "rgba(212, 175, 55, 0.05)", borderColor: "rgba(212,175,55,0.2)" }}>
          <h2 className="text-2xl font-bold arc-font-display mb-6" style={{ color: "var(--arc-text-hero)" }}>
            💡 Why is Nebula useful for you?
          </h2>
          <ul className="space-y-5">
            <li className="flex gap-4 items-start">
              <span className="text-2xl mt-1 flex-shrink-0">⚡</span>
              <p className="text-sm md:text-base leading-relaxed text-slate-200">
                <strong className="text-white">Saves Time:</strong> Stop manually searching for study materials. Nebula generates highly tailored notes, flashcards, and quizzes in seconds.
              </p>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-2xl mt-1 flex-shrink-0">🛡️</span>
              <p className="text-sm md:text-base leading-relaxed text-slate-200">
                <strong className="text-white">Secure BYOK System:</strong> Bring Your Own Key means maximum privacy. Your data is completely isolated, and your Gemini API key is encrypted with military-grade AES-256-GCM.
              </p>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-2xl mt-1 flex-shrink-0">📈</span>
              <p className="text-sm md:text-base leading-relaxed text-slate-200">
                <strong className="text-white">Gamified Progress:</strong> Studying shouldn't be boring. Track your learning streaks, earn experience points (XP), and unlock badges as you master new topics.
              </p>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-2xl mt-1 flex-shrink-0">🧘</span>
              <p className="text-sm md:text-base leading-relaxed text-slate-200">
                <strong className="text-white">Distraction-Free Environment:</strong> A beautiful, premium glassmorphic interface designed to reduce cognitive load and keep you deeply focused on learning.
              </p>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default SummaryPage;
