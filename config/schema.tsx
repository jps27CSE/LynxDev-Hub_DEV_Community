import {
  boolean,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  bio: text(),
  skills: json(),
  points: int().default(0),
  subscription: varchar({ length: 255 }),
});

export const courses = mysqlTable("courses", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  icon: varchar({ length: 255 }),
  difficulty: varchar({ length: 50 }).notNull().default("Beginner"),
  category: varchar({ length: 100 }),
  order_index: int("order_index").default(0),
  is_published: boolean("is_published").default(true),
});

export const chapters = mysqlTable("chapters", {
  id: int().primaryKey().autoincrement(),
  course_id: int("course_id")
    .references(() => courses.id)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: json().notNull(),
  order_index: int("order_index").default(0),
  points_reward: int("points_reward").default(10),
});

export const enrollments = mysqlTable("enrollments", {
  id: int().primaryKey().autoincrement(),
  user_id: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  course_id: int("course_id")
    .references(() => courses.id)
    .notNull(),
  progress: json(),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const interviewCategories = mysqlTable("interview_categories", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  description: text().notNull(),
  icon: varchar({ length: 10 }),
  color: varchar({ length: 50 }),
  order_index: int("order_index").default(0),
});

export const interviewChapters = mysqlTable("interview_chapters", {
  id: int().primaryKey().autoincrement(),
  category_id: int("category_id")
    .references(() => interviewCategories.id)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: json().notNull(),
  order_index: int("order_index").default(0),
});

export const interviewQuestions = mysqlTable("interview_questions", {
  id: int().primaryKey().autoincrement(),
  question: text().notNull(),
  answer: text().notNull(),
  difficulty: varchar({ length: 20 }).notNull().default("medium"),
  tags: json(),
  is_top50: boolean("is_top50").default(false),
});

export const interviewQuestionChapters = mysqlTable("interview_question_chapters", {
  id: int().primaryKey().autoincrement(),
  question_id: int("question_id")
    .references(() => interviewQuestions.id)
    .notNull(),
  chapter_id: int("chapter_id")
    .references(() => interviewChapters.id)
    .notNull(),
});

export const mentorConversations = mysqlTable("mentor_conversations", {
  id: int().primaryKey().autoincrement(),
  user_id: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  messages: json().notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const problems = mysqlTable("problems", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  difficulty: varchar({ length: 20 }).notNull().default("medium"),
  category: varchar({ length: 100 }),
  tags: json(),
  starter_code: text("starter_code"),
  solution_code: text("solution_code"),
  test_cases: json("test_cases"),
  order_index: int("order_index").default(0),
});
