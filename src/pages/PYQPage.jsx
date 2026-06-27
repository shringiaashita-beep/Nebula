import PYQDatabase from "../components/PYQDatabase";

function PYQPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="arc-font-display text-3xl font-bold arc-text-gradient">
          📚 Quiz Treasure
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--arc-text-secondary)" }}>
          Search, filter, and practice previous year questions from all competitive exams
        </p>
      </div>

      {/* Render Quiz Treasure module directly */}
      <PYQDatabase />
    </div>
  );
}

export default PYQPage;