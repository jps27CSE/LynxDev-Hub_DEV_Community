import { NextResponse } from "next/server";
import { getQuestionsByCategorySlugAndTags } from "@/lib/interview-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categorySlug, tags = [] } = body;

    if (!categorySlug) {
      return NextResponse.json({ error: "categorySlug is required" }, { status: 400 });
    }

    const questions = await getQuestionsByCategorySlugAndTags(categorySlug, tags);

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
