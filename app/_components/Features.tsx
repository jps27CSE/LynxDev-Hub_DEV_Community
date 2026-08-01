import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Interactive Courses",
    description:
      "Learn by doing with hands-on coding exercises, real-time feedback, and structured chapters like freeCodeCamp.",
    icon: "💻",
  },
  {
    title: "AI Developer Mentor",
    description:
      "Get help with debugging, coding questions, and career guidance -- powered by Gemini and Groq AI.",
    icon: "🤖",
  },
  {
    title: "Developer Community",
    description:
      "Connect with fellow developers, share knowledge, ask questions, and grow together.",
    icon: "👥",
  },
  {
    title: "Interview Prep",
    description:
      "Practice with categorized questions, tag-based customization, and AI-generated question sets.",
    icon: "🎯",
  },
];

function Features() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-primary">Level Up</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to job-ready -- all free, all in one place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 hover:border-border transition-colors"
            >
              <CardHeader>
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
