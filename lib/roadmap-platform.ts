import { allCourses } from "@/config/courses";
import { buildPlatformCourseMap } from "@/config/roadmaps/platform";
import type { PlatformCourseRef } from "@/config/roadmaps/types";
import type { CourseKey } from "@/config/courses/types";
import { getAllCourses } from "@/lib/course-data";
import { createLogger } from "@/lib/logger";

const log = createLogger("roadmap-platform");

/**
 * Server-only: resolve roadmap course keys to real course ids.
 *
 * Degrades to `{}` when the course query fails, which hides the in-platform
 * course links and leaves the System Design lesson links (no DB involved)
 * rendering normally. A failed read must never turn a roadmap page into a 500 —
 * this page already renders fine without any platform links.
 */
export async function getPlatformCourseMap(): Promise<
  Partial<Record<CourseKey, PlatformCourseRef>>
> {
  try {
    const dbCourses = await getAllCourses();
    return buildPlatformCourseMap(allCourses, dbCourses);
  } catch (error) {
    log.error("failed to resolve platform courses", error);
    return {};
  }
}
