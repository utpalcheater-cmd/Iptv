import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { agentProjectsTable } from "./agent-projects";

export const agentConversationsTable = pgTable(
  "nabeen_agent_conversations",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => agentProjectsTable.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New conversation"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("nabeen_agent_conversations_owner_updated_idx").on(
      table.ownerId,
      table.updatedAt,
    ),
    index("nabeen_agent_conversations_project_idx").on(table.projectId),
  ],
);

export const insertAgentConversationSchema = createInsertSchema(
  agentConversationsTable,
).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentConversation = z.infer<
  typeof insertAgentConversationSchema
>;
export type AgentConversation = typeof agentConversationsTable.$inferSelect;