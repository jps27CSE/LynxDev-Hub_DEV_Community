"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import VisualPlayer from "./VisualPlayer";
import DsaCodeRunner from "./DsaCodeRunner";
import type { DsaLesson, DsaLessonSection } from "@/config/dsa/types";

type Props = {
  moduleSlug: string;
  lesson: DsaLesson;
};

function renderSection(section: DsaLessonSection, i: number) {
  switch (section.kind) {
    case "scenario":
    case "concept":
    case "compare": {
      const title =
        section.kind === "compare"
          ? null
          : (section as { title?: string }).title;
      return (
        <div key={i} className="space-y-2">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          <div
            className="text-sm leading-7 text-foreground/80"
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        </div>
      );
    }
    case "visual":
      return (
        <div key={i} className="space-y-2">
          <h3 className="text-base font-semibold">{section.title}</h3>
          <VisualPlayer frames={section.frames} />
        </div>
      );
    case "code":
      return (
        <div key={i} className="space-y-2">
          <h3 className="text-base font-semibold">{section.title}</h3>
          <DsaCodeRunner
            starter={section.starter}
            solution={section.solution}
            language={section.language}
            tests={section.tests}
          />
        </div>
      );
    case "your_turn":
      return (
        <div key={i} className="rounded-lg border border-border/40 bg-muted/30 p-4">
          <p className="text-sm font-medium">Your turn</p>
          <p className="text-sm text-muted-foreground mt-1">{section.prompt}</p>
        </div>
      );
    case "recap":
      return (
        <div key={i} className="space-y-2">
          <h3 className="text-base font-semibold">Recap</h3>
          <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1">
            {section.points.map((p, j) => (
              <li key={j}>{p}</li>
            ))}
          </ul>
        </div>
      );
    case "video":
      return (
        <div key={i} className="space-y-2">
          <h3 className="text-base font-semibold">{section.title}</h3>
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${section.videoId}`}
              title={section.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
          {section.caption && (
            <p className="text-xs text-muted-foreground">{section.caption}</p>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default function DsaLessonView({ moduleSlug, lesson }: Props) {
  const { setUserDetail } = useContext(UserDetailContext);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const res = await axios.post("/api/dsa/progress", {
        moduleSlug,
        lessonSlug: lesson.slug,
      });
      if (res.data.message === "Already completed") {
        setCompleted(true);
        return;
      }
      setCompleted(true);
      if (res.data.points) {
        setUserDetail?.((prev) =>
          prev ? { ...prev, points: res.data.points } : prev,
        );
      }
      toast(`+${res.data.pointsAwarded ?? 10} points`, {
        icon: "⭐",
      });
    } catch {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      {lesson.sections.map((s, i) => renderSection(s, i))}
      <div className="pt-4">
        <Button
          onClick={handleMarkComplete}
          disabled={completed || completing}
          variant={completed ? "outline" : "default"}
          className="w-full"
        >
          {completing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          {completed ? "Completed" : "Mark as Complete"}
        </Button>
      </div>
      {lesson.sources && lesson.sources.length > 0 && (
        <div className="pt-4 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
          <ul className="space-y-1">
            {lesson.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
