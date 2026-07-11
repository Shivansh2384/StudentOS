import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  date,
  serial,
} from "drizzle-orm/pg-core";

// Assignments
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  className: text("class_name").default(""),
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").notNull().default("medium"),
  estimatedTime: integer("estimated_time").default(30),
  status: text("status").notNull().default("not_started"),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Opportunities
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("event"),
  deadline: timestamp("deadline"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("found"),
  description: text("description").default(""),
  link: text("link").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habits
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").default("✅"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habit completions
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .references(() => habits.id)
    .notNull(),
  completedDate: date("completed_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schedule blocks
export const scheduleBlocks = pgTable("schedule_blocks", {
  id: serial("id").primaryKey(),
  time: text("time").notNull(),
  label: text("label").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bus routine completions
export const busCompletions = pgTable("bus_completions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  itemIndex: integer("item_index").notNull(),
  completedDate: date("completed_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull().default(""),
  time: text("time").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  days: text("days").notNull().default("all"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
