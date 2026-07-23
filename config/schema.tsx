import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  points: integer().default(0),
  subscription: varchar(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  icon: varchar({ length: 255 }),
  difficulty: varchar({ length: 50 }).notNull().default("Beginner"),
  category: varchar({ length: 100 }),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: jsonb().notNull().default({ instructions: "", initialCode: "" }),
  order_index: integer("order_index").default(0),
  points_reward: integer("points_reward").default(10),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  course_id: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  progress: jsonb().default({ completedChapters: [], currentChapter: 1 }),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});
