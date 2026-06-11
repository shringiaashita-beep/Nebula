import SubjectsSection from "../components/SubjectsSection";
import TopicsSection from "../components/TopicsSection";
import QuestionBank from "../components/QuestionBank";
import SyllabusGenerator from "../components/SyllabusGenerator";

function SubjectsPage({ selectedSubject }) {
  return (
    <div className="space-y-8">
      <SubjectsSection />
      <TopicsSection selectedSubject={selectedSubject} />
      <QuestionBank />
      <SyllabusGenerator />
    </div>
  );
}

export default SubjectsPage;