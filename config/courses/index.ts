import type { CourseData } from "./types";

export type { CourseData, ChapterContent } from "./types";

import { htmlCourse } from "./html";
import { cssCourse } from "./css";
import { jsCourse } from "./javascript";
import { cCourse } from "./c";
import { cppCourse } from "./cpp";
import { javaCourse } from "./java";
import { csharpCourse } from "./csharp";
import { pythonCourse } from "./python";

export {
  htmlCourse,
  cssCourse,
  jsCourse,
  cCourse,
  cppCourse,
  javaCourse,
  csharpCourse,
  pythonCourse,
};

export const allCourses: CourseData[] = [
  htmlCourse,
  cssCourse,
  jsCourse,
  cCourse,
  cppCourse,
  javaCourse,
  csharpCourse,
  pythonCourse,
];
