import { cache } from "react";
import { db } from "@/config/db";
import { problems } from "@/config/schema";
import { eq, asc, count, and } from "drizzle-orm";

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

export const getAllProblems = cache(async (
  opts?: {
    limit?: number;
    offset?: number;
    difficulty?: string;
    category?: string;
  }
): Promise<{ problems: Problem[]; total: number }> => {
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
    console.error("[problem-data] getAllProblems:", error);
    return { problems: [], total: 0 };
  }
});

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
    console.error("[problem-data] getProblemCategories:", error);
    return [];
  }
});

export const getProblemById = cache(async (id: number): Promise<Problem | null> => {
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
    console.error("[problem-data] getProblemById:", error);
    return null;
  }
});
