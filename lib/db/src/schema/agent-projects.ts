import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const agentProjectsTable = pgTable(
  "nabeen_agent_projects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    language: text("language").notNull().default("HTML/CSS/JS"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("nabeen_agent_projects_owner_idx").on(table.ownerId)],
);

export const insertAgentProjectSchema = createInsertSchema(
  agentProjectsTable,
).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentProject = z.infer<typeof insertAgentProjectSchema>;
export type AgentProject = typeof agentProjectsTable.$inferSelect;