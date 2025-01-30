import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { sql } from 'drizzle-orm';

export const coursesTable = pgTable('courses_table', {
  id: text('id')
    .primaryKey()
    .unique()
    .default(sql`gen_random_uuid()`), // Auto-generate UUID as a string
  name: text('name').notNull(),
  category: text('category').notNull(),
  trainer: text('trainer').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertCourse = typeof coursesTable.$inferInsert;
export type SelectCourse = typeof coursesTable.$inferSelect;
