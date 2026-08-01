"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Loader2,
  Sparkles,
  BookOpen,
  Trophy,
  CheckCircle2,
  PenLine,
  User,
  AtSign,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!clerkUser) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || clerkUser.fullName || "");
        setBio(data.bio || "");
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setPoints(data.points || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/enroll")
      .then((r) => r.json())
      .then((data) => {
        setEnrolledCount(data.length);
        setCompletedCount(
          data.filter((e: { completed_at: string | null }) => e.completed_at)
            .length,
        );
      })
      .catch(() => {});
  }, [clerkUser]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, skills }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    { label: "Points", value: points, icon: Sparkles, color: "text-amber-500" },
    {
      label: "Skills",
      value: skills.length,
      icon: Layers,
      color: "text-blue-500",
    },
    {
      label: "Enrolled",
      value: enrolledCount,
      icon: BookOpen,
      color: "text-emerald-500",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: Trophy,
      color: "text-violet-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl ring-2 ring-border/50 overflow-hidden">
                {clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-display font-bold tracking-tight truncate">
                {name || "Developer"}
              </h1>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <AtSign className="w-3.5 h-3.5" />
                <span className="truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-border/50 bg-card p-4 text-center transition-all hover:border-border hover:shadow-sm"
                >
                  <Icon className={`w-5 h-5 ${s.color} mx-auto`} />
                  <p className="text-xl font-bold mt-1.5">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/30">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Name</h2>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 px-0 py-1 bg-transparent text-sm text-foreground outline-none border-b border-transparent focus:border-primary/30 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Bio</h2>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full mt-2 px-0 py-1 bg-transparent text-sm text-foreground outline-none border-b border-transparent focus:border-primary/30 transition-colors resize-none"
                placeholder="Tell us about yourself — your experience, interests, goals..."
              />
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Skills</h2>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                  className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm text-foreground outline-none focus:border-primary/30 transition-colors"
                  placeholder="Type a skill and press Enter..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-background text-xs font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">
                  No skills added yet. Add your technical skills above.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {saved && (
                <span className="text-emerald-500 font-medium">
                  Saved successfully
                </span>
              )}
            </p>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
