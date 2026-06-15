import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import supabase from "../lib/supabase";

function StudyGalaxy({
  setSelectedSubject,
  selectedSubject,
}) {
  const [
  subjectTopics,
  setSubjectTopics,
] = useState([]);
  const [subjects, setSubjects] =
    useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);
  const fetchTopicsForSubject =
  async (subjectName) => {
    const { data } =
      await supabase
        .from("topics")
        .select("*")
        .eq(
          "subject_name",
          subjectName
        );

    setSubjectTopics(
      data || []
    );
  };

  const fetchSubjects =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const { data } =
        await supabase
          .from("subjects")
          .select("*")
          .eq(
            "user_id",
            user.id
          );
              console.log(data);
      setSubjects(
        data || []
      );
    };

  const positions = [
    {
      top: "12%",
      left: "50%",
      transform:
        "translateX(-50%)",
    },
    {
      top: "50%",
      left: "12%",
      transform:
        "translateY(-50%)",
    },
    {
      top: "50%",
      right: "12%",
      transform:
        "translateY(-50%)",
    },
    {
      bottom: "12%",
      left: "50%",
      transform:
        "translateX(-50%)",
    },
    {
      top: "22%",
      left: "22%",
    },
    {
      top: "22%",
      right: "22%",
    },
    {
      bottom: "22%",
      left: "22%",
    },
    {
      bottom: "22%",
      right: "22%",
    },
  ];

  return (
    <div className="relative bg-[#020B2D] rounded-3xl h-[700px] overflow-hidden shadow-2xl">

      {/* Orbit Rings */}
      <div className="absolute left-1/2 top-1/2 w-[320px] h-[320px] border border-slate-700 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

      <div className="absolute left-1/2 top-1/2 w-[520px] h-[520px] border border-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

      {/* Center Brain */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-40 h-40 rounded-full bg-primary-500 flex items-center justify-center text-white text-6xl shadow-[0_0_80px_rgba(59,130,246,0.8)]">
          🧠
        </div>
      </motion.div>

      {/* Dynamic Subjects */}
      {subjects.map(
        (
          subject,
          index
        ) => {
            console.log(subject);
          const pos =
            positions[
              index %
                positions.length
            ];
            const colors = [
  "bg-gradient-to-br from-violet-600 to-purple-700",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
  "bg-gradient-to-br from-emerald-500 to-green-600",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-indigo-500 to-violet-700",
];

const color =
  colors[
    index %
      colors.length
  ];

          return (
            <motion.div
              key={
                subject.id
              }
              animate={{
                y: [
                  -8,
                  8,
                  -8,
                ],
              }}
              transition={{
                duration:
                  4 +
                  index,
                repeat:
                  Infinity,
              }}
              className="absolute"
              style={
                pos
              }
            >
              <div
  onClick={() => {
    setSelectedSubject(
      subject.name
    );

    fetchTopicsForSubject(
      subject.name
    );
  }}
  className={`
  w-52
  h-32
  ${color}
  rounded-3xl
  p-4
  cursor-pointer
  shadow-2xl
  hover:scale-105
  hover:-translate-y-2
  transition-all
  duration-300
  flex
  flex-col
  justify-center
  `}
>

  <h3 className="text-white text-lg font-bold">
    {subject.name}
  </h3>

  <p className="text-white/80 text-sm mt-1">
    Continue Learning →
  </p>

</div>
            </motion.div>
          );
        }
      )}

      {/* Title */}
      <div className="absolute top-6 left-6 text-white">
        <h2 className="text-3xl font-bold">
          Study Galaxy
        </h2>

        <p className="text-slate-400">
          Your learning universe
        </p>
      </div>
      {selectedSubject && (
  <div className="absolute right-8 top-32 w-80 bg-slate-900/90 backdrop-blur-lg border border-primary-500 rounded-2xl p-4 shadow-[0_0_40px_rgba(34,211,238,0.5)]">

    <div className="mb-4">
  <h3 className="text-primary-400 text-2xl font-bold">
    {selectedSubject}
  </h3>

  <p className="text-slate-400 text-sm">
    {subjectTopics.length} Topics
  </p>
</div>

    <div className="space-y-2">
      {subjectTopics.map(
        (topic) => (
          <div
            key={topic.id}
            className="bg-slate-800 p-3 rounded-lg text-white"
          >
            {topic.topic_name}
          </div>
        )
      )}
    </div>

  </div>
)}
    </div>
  );
}

export default StudyGalaxy;