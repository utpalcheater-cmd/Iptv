import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { agentConversationsTable } from "./agent-conversations";

export const agentMessagesTable = pgTable(
  "nabeen_agent_messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => agentConversationsTable.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("nabeen_agent_messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export const insertAgentMessageSchema = createInsertSchema(
  agentMessagesTable,
).omit({
  createdAt: true,
});

export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type AgentMessageRecord = typeof agentMessagesTable.$inferSelect;