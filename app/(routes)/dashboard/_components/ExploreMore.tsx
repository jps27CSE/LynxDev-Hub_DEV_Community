import Image from "next/image";

const ExplorMoreOptions = [
  {
    id: 1,
    title: "Quizz Pack",
    desc: "Practice what you learned with bite-sized code challenges.",
    icon: "/quiz.png",
  },
  {
    id: 2,
    title: "Video Courses",
    desc: "Learn with structured video lessons taught step-by-step.",
    icon: "/online-course.png",
  },
  {
    id: 3,
    title: "Community Project",
    desc: "Build real-world apps by collaborating with the community.",
    icon: "/project.png",
  },
  {
    id: 4,
    title: "Talk with AI",
    desc: "Chat with AI to get help, explanations, and debugging tips.",
    icon: "/ai.png",
  },
];

const ExploreMore = () => {
  return (
    <div>
      <h2 className="text-3xl mb-2 font-mono font-bold">Explore More</h2>
      <div>
        {ExplorMoreOptions.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Image
              src={option?.icon}
              alt={option.title}
              width={80}
              height={80}
            />
            <div>
              <h2>{option?.title}</h2>
              <p>{option.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreMore;
