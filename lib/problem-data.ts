import { db } from "@/config/db";
import { problems } from "@/config/schema";
import { eq, asc } from "drizzle-orm";

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

export async function getAllProblems(): Promise<Problem[]> {
  try {
    const result = await db
      .select()
      .from(problems)
      .orderBy(asc(problems.order_index));
    return result.map((p) => ({
      ...p,
      tags: p.tags as string[],
      test_cases: p.test_cases as TestCase[] | null,
    }));
  } catch {
    return [];
  }
}

export async function getProblemById(id: number): Promise<Problem | null> {
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
  } catch {
    return null;
  }
}
