import { createInsertSchema } from "drizzle-zod";
import { numeric, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const availabilityStatusEnum = pgEnum("availability_status", [
  "available",
  "deployed",
  "unavailable",
]);

export const consultantsTable = pgTable("consultants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  skills: text("skills").array().notNull().default([]),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2, mode: "number" })
    .notNull(),
  availabilityStatus: availabilityStatusEnum("availability_status")
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConsultantSchema = createInsertSchema(consultantsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConsultant = z.infer<typeof insertConsultantSchema>;
export type Consultant = typeof consultantsTable.$inferSelect;