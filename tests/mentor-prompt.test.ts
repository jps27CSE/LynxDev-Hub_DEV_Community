/**
 * @file
 *
 * Pins `buildSystemPrompt` (`lib/mentor.ts:102`) — builds the AI mentor system prompt.
 *
 * This is a pure string construction function — no I/O, fully testable.
 * The prompt is the CORE of the AI mentor feature; it determines how the AI
 * perceives the user and how it responds.
 *
 * A regression here means:
 *   - Wrong user context injected (wrong name, skills, courses)
 *   - Broken formatting (missing sections, malformed lists)
 *   - Role instructions changed (tone, behavior, constraints)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSystemPrompt } from "../lib/mentor";

type UserContext = {
  name: string;
  bio: string | null;
  skills: string[];
  points: number;
  courses: { title: string; progress: number; total: number }[];
};

function sampleUser(overrides: Partial<UserContext> = {}): UserContext {
  return {
    name: "Test User",
    bio: "A test bio for the user.",
    skills: ["JavaScript", "React", "TypeScript"],
    points: 150,
    courses: [
      { title: "HTML Fundamentals", progress: 5, total: 10 },
      { title: "CSS Basics", progress: 3, total: 8 },
    ],
    ...overrides,
  };
}

describe("buildSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const user = sampleUser();
    const prompt = buildSystemPrompt(user);
    assert.ok(typeof prompt === "string");
    assert.ok(prompt.length > 100);
  });

  it("includes the role definition", () => {
    const user = sampleUser();
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /You are Lynx/);
    assert.match(prompt, /encouraging, practical coding mentor/);
  });

  it("includes user name", () => {
    const user = sampleUser({ name: "Alice" });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Name: Alice/);
  });

  it("includes user bio when provided", () => {
    const user = sampleUser({ bio: "Full-stack developer" });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Bio: Full-stack developer/);
  });

  it("shows 'Not provided' when bio is null", () => {
    const user = sampleUser({ bio: null });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Bio: Not provided/);
  });

  it("shows 'Not provided' when bio is undefined", () => {
    const user = sampleUser({ bio: undefined as any });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Bio: Not provided/);
  });

  it("includes skills as comma-separated list", () => {
    const user = sampleUser({ skills: ["JavaScript", "React", "TypeScript"] });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Skills: JavaScript, React, TypeScript/);
  });

  it("shows 'No skills added yet' for empty skills array", () => {
    const user = sampleUser({ skills: [] });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Skills: No skills added yet/);
  });

  it("includes points", () => {
    const user = sampleUser({ points: 420 });
    const prompt = buildSystemPrompt(user);
    assert.match(prompt, /Points: 420/);
  });

  describe("enrolled courses section", () => {
    it("lists courses with progress/total", () => {
      const user = sampleUser({
        courses: [
          { title: "HTML Fundamentals", progress: 5, total: 10 },
          { title: "CSS Basics", progress: 3, total: 8 },
        ],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /- HTML Fundamentals: 5\/10 chapters/);
      assert.match(prompt, /- CSS Basics: 3\/8 chapters/);
    });

    it("shows 'No enrolled courses yet' for empty array", () => {
      const user = sampleUser({ courses: [] });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Enrolled Courses:\nNo enrolled courses yet/);
    });

    it("handles course with zero progress", () => {
      const user = sampleUser({
        courses: [{ title: "New Course", progress: 0, total: 5 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /- New Course: 0\/5 chapters/);
    });

    it("handles course with full progress", () => {
      const user = sampleUser({
        courses: [{ title: "Done Course", progress: 10, total: 10 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /- Done Course: 10\/10 chapters/);
    });
  });

  describe("role instructions", () => {
    it("includes all 5 role instructions", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);

      // Check for key phrases from each instruction
      assert.match(prompt, /Assess their level/); // #1
      assert.match(prompt, /Suggest what to learn next/); // #2
      assert.match(prompt, /Answer coding questions/); // #3
      assert.match(prompt, /Keep responses concise/); // #4
      assert.match(prompt, /Be encouraging/); // #5
    });

    it("references specific LynxDEV courses in instruction #2", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      // Escape + and # for regex
      assert.match(prompt, /HTML, CSS, JavaScript, Python, Java, C, C\+\+, C#, DSA problems, interview prep/);
    });

    it("defines beginner/intermediate/advanced criteria", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Beginner = 0-2 skills/);
      assert.match(prompt, /Intermediate = 3-5 skills/);
      assert.match(prompt, /Advanced = 6\+ skills/);
    });

    it("includes off-topic steering instruction", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /off-topic, gently steer back to coding/);
    });

    it("includes no-generic-advice instruction", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Never give generic advice/);
    });
  });

  describe("formatting", () => {
    it("has proper section headers (## User Profile, ## Your Role)", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /## User Profile/);
      assert.match(prompt, /## Your Role/);
    });

    it("uses dash bullet points for courses", () => {
      const user = sampleUser({
        courses: [{ title: "Course 1", progress: 1, total: 2 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /^- Course 1: 1\/2 chapters/m);
    });

    it("numbered list for role instructions", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /^\d+\./m);
    });
  });

  describe("different user profiles", () => {
    it("beginner profile (0-2 skills, early chapters)", () => {
      const user = sampleUser({
        skills: ["HTML"],
        courses: [{ title: "HTML Fundamentals", progress: 2, total: 10 }],
      });
      const prompt = buildSystemPrompt(user);
      // The prompt should contain the criteria; AI will assess
      assert.match(prompt, /Beginner = 0-2 skills/);
    });

    it("intermediate profile (3-5 skills)", () => {
      const user = sampleUser({
        skills: ["JavaScript", "React", "TypeScript", "Node.js"],
        courses: [{ title: "React Course", progress: 5, total: 10 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Intermediate = 3-5 skills/);
    });

    it("advanced profile (6+ skills)", () => {
      const user = sampleUser({
        skills: ["JavaScript", "React", "TypeScript", "Node.js", "Python", "Go", "Rust"],
        courses: [{ title: "Advanced Course", progress: 8, total: 10 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Advanced = 6\+ skills/);
    });

    it("high points user", () => {
      const user = sampleUser({ points: 10000 });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Points: 10000/);
    });

    it("user with many courses", () => {
      const user = sampleUser({
        courses: Array.from({ length: 10 }, (_, i) => ({
          title: `Course ${i + 1}`,
          progress: i + 1,
          total: 10,
        })),
      });
      const prompt = buildSystemPrompt(user);
      // Should list all 10 courses
      for (let i = 1; i <= 10; i++) {
        assert.match(prompt, new RegExp(`- Course ${i}: ${i}\\/10 chapters`));
      }
    });
  });

  describe("edge cases", () => {
    it("handles special characters in name", () => {
      const user = sampleUser({ name: 'O\'Connor & "Smith"' });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Name: O'Connor & "Smith"/);
    });

    it("handles special characters in bio", () => {
      const user = sampleUser({ bio: "Bio with <brackets> & 'quotes'" });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Bio: Bio with <brackets> & 'quotes'/);
    });

    it("handles unicode in name and bio", () => {
      const user = sampleUser({
        name: "用户名",
        bio: "Bio with émojis 🎉 and 日本語",
      });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Name: 用户名/);
      assert.match(prompt, /Bio: Bio with émojis 🎉 and 日本語/);
    });

    it("handles unicode in skills", () => {
      const user = sampleUser({ skills: ["JavaScript", "React 中文", "TypeScript 🚀"] });
      const prompt = buildSystemPrompt(user);
      assert.match(prompt, /Skills: JavaScript, React 中文, TypeScript 🚀/);
    });

    it("handles very long bio", () => {
      const user = sampleUser({ bio: "x".repeat(1000) });
      const prompt = buildSystemPrompt(user);
      assert.ok(prompt.includes("Bio: " + "x".repeat(1000)));
    });

    it("handles very long course titles", () => {
      const user = sampleUser({
        courses: [{ title: "x".repeat(200), progress: 1, total: 10 }],
      });
      const prompt = buildSystemPrompt(user);
      assert.ok(prompt.includes("x".repeat(200)));
    });
  });

  describe("determinism", () => {
    it("same user input produces identical prompt", () => {
      const user = sampleUser();
      const prompt1 = buildSystemPrompt(user);
      const prompt2 = buildSystemPrompt(user);
      assert.equal(prompt1, prompt2);
    });

    it("different users produce different prompts", () => {
      const user1 = sampleUser({ name: "User 1", points: 100 });
      const user2 = sampleUser({ name: "User 2", points: 200 });
      const prompt1 = buildSystemPrompt(user1);
      const prompt2 = buildSystemPrompt(user2);
      assert.notEqual(prompt1, prompt2);
    });
  });

  describe("structure verification", () => {
    it("contains all expected profile fields in order", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);

      // Order should be: Name, Bio, Skills, Points, Enrolled Courses
      const nameIdx = prompt.indexOf("Name:");
      const bioIdx = prompt.indexOf("Bio:");
      const skillsIdx = prompt.indexOf("Skills:");
      const pointsIdx = prompt.indexOf("Points:");
      const coursesIdx = prompt.indexOf("Enrolled Courses:");

      assert.ok(nameIdx < bioIdx);
      assert.ok(bioIdx < skillsIdx);
      assert.ok(skillsIdx < pointsIdx);
      assert.ok(pointsIdx < coursesIdx);
    });

    it("role instructions are numbered 1-5", () => {
      const user = sampleUser();
      const prompt = buildSystemPrompt(user);
      // Use multiline flag (m) so ^ matches start of each line
      for (let i = 1; i <= 5; i++) {
        assert.match(prompt, new RegExp(`^\\s*${i}\\.`, "m"), `Missing instruction ${i}`);
      }
    });
  });
});