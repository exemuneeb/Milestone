import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { consultantsTable } from "./consultants";
import { clientsTable } from "./clients";

export const engagementsTable = pgTable("engagements", {
  id: serial("id").primaryKey(),
  consultantId: integer("consultant_id")
    .notNull()
    .references(() => consultantsTable.id, { onDelete: "cascade" }),
  clientId: integer("client_id")
    .references(() => clientsTable.id, { onDelete: "set null" }),
  projectName: text("project_name").notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEngagementSchema = createInsertSchema(engagementsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEngagement = z.infer<typeof insertEngagementSchema>;
export type Engagement = typeof engagementsTable.$inferSelect;