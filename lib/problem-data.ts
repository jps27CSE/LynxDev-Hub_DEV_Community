import { cache } from "react";
import { db } from "@/config/db";
import { problems } from "@/config/schema";
import { eq, asc, count, and } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { TOP_PROBLEMS, type TopProblem } from "@/config/problems/top-problems";
import { TOP_STATEMENTS } from "@/config/problems/top-statements";

const log = createLogger("problem-data");

export type Problem = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string | null;
  tags: string[];
  starter_code: string | null;
  solution_code: string | null;
  test_cases: TestCase[] | null;
};

export type TestCase = {
  input: string;
  expected: string;
};

export const getAllProblems = cache(
  async (opts?: {
    limit?: number;
    offset?: number;
    difficulty?: string;
    category?: string;
  }): Promise<{ problems: Problem[]; total: number }> => {
    try {
      const conditions = [];
      if (opts?.difficulty && opts.difficulty !== "all") {
        conditions.push(eq(problems.difficulty, opts.difficulty));
      }
      if (opts?.category && opts.category !== "all") {
        conditions.push(eq(problems.category, opts.category));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [{ value: rawTotal }] = await db
        .select({ value: count() })
        .from(problems)
        .where(where);
      const total = Number(rawTotal);

      const query = db
        .select()
        .from(problems)
        .where(where)
        .orderBy(asc(problems.order_index))
        .$dynamic();

      const result = await (opts?.limit
        ? query.limit(opts.limit).offset(opts?.offset ?? 0)
        : query);
      return {
        problems: result.map((p) => ({
          ...p,
          tags: p.tags as string[],
          test_cases: p.test_cases as TestCase[] | null,
        })),
        total,
      };
    } catch (error) {
      log.error("getAllProblems failed", error);
      return { problems: [], total: 0 };
    }
  },
);

export const getProblemCategories = cache(async (): Promise<string[]> => {
  try {
    const result = await db
      .selectDistinct({ category: problems.category })
      .from(problems);
    return result
      .map((r) => r.category)
      .filter((c): c is string => c !== null)
      .sort();
  } catch (error) {
    log.error("getProblemCategories failed", error);
    return [];
  }
});

export const getProblemById = cache(
  async (id: number): Promise<Problem | null> => {
    try {
      const result = await db
        .select()
        .from(problems)
        .where(eq(problems.id, id))
        .limit(1);
      if (result.length === 0) return null;
      const p = result[0];
      return {
        ...p,
        tags: p.tags as string[],
        test_cases: p.test_cases as TestCase[] | null,
      };
    } catch (error) {
      log.error("getProblemById failed", error);
      return null;
    }
  },
);

// ── Problems workspace (unified in-house + top LeetCode) ────────────────

export type WorkspaceSource = "in-house" | "top";

export type WorkspaceProblem = {
  key: string;
  title: string;
  difficulty: "basic" | "easy" | "medium" | "hard";
  topics: string[];
  group: string | null;
  source: WorkspaceSource;
  statement: string;
  starterCode: string;
  leetcodeUrl: string | null;
};

export type WorkspaceSummary = Omit<
  WorkspaceProblem,
  "statement" | "starterCode"
>;

function toSummary(
  key: string,
  title: string,
  difficulty: string,
  topics: string[],
  group: string | null,
  source: WorkspaceSource,
  leetcodeUrl: string | null,
): WorkspaceSummary {
  return {
    key,
    title,
    difficulty: (["basic", "easy", "medium", "hard"].includes(difficulty)
      ? difficulty
      : "easy") as WorkspaceSummary["difficulty"],
    topics,
    group,
    source,
    leetcodeUrl,
  };
}

export const getInHouseSummaries = cache(
  async (): Promise<WorkspaceSummary[]> => {
    const { problems: list } = await getAllProblems({ limit: 100, offset: 0 });
    return list.map((p) =>
      toSummary(
        `db:${p.id}`,
        p.title,
        p.difficulty,
        p.tags,
        p.category,
        "in-house",
        null,
      ),
    );
  },
);

export const getTopSummaries = cache((): WorkspaceSummary[] => {
  return TOP_PROBLEMS.filter((p) => TOP_STATEMENTS[p.slug]).map((p) =>
    toSummary(
      p.slug,
      p.title,
      p.difficulty,
      p.topics,
      p.group,
      "top",
      `https://leetcode.com/problems/${p.slug}/`,
    ),
  );
});

export const getAllWorkspaceSummaries = cache(
  async (): Promise<WorkspaceSummary[]> => {
    const [inHouse, top] = await Promise.all([
      getInHouseSummaries(),
      Promise.resolve(getTopSummaries()),
    ]);
    return [...inHouse, ...top];
  },
);

export const resolveWorkspaceProblem = cache(
  async (slug: string): Promise<WorkspaceProblem | null> => {
    if (/^\d+$/.test(slug)) {
      const p = await getProblemById(Number(slug));
      if (!p) return null;
      return {
        key: `db:${p.id}`,
        title: p.title,
        difficulty: (["basic", "easy", "medium", "hard"].includes(p.difficulty)
          ? p.difficulty
          : "easy") as WorkspaceProblem["difficulty"],
        topics: p.tags,
        group: p.category,
        source: "in-house",
        statement: p.description,
        starterCode: p.starter_code ?? "",
        leetcodeUrl: null,
      };
    }

    const top: TopProblem | undefined = TOP_PROBLEMS.find(
      (t) => t.slug === slug,
    );
    const statement = top ? TOP_STATEMENTS[top.slug] : undefined;
    if (!top || !statement) return null;
    return {
      key: top.slug,
      title: top.title,
      difficulty: top.difficulty,
      topics: top.topics,
      group: top.group,
      source: "top",
      statement: statement.markdown,
      starterCode: statement.starterCode,
      leetcodeUrl: `https://leetcode.com/problems/${top.slug}/`,
    };
  },
);
