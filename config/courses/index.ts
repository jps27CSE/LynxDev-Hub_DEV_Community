import type { CourseData } from "./types";
import { htmlCourse } from "./html";
import { cssCourse } from "./css";
import { jsCourse } from "./js";

export type { CourseData, ChapterContent } from "./types";

export const allCourses: CourseData[] = [htmlCourse, cssCourse, jsCourse];
