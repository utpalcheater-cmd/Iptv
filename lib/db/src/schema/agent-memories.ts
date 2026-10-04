import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const agentMemoriesTable = pgTable(
  "nabeen_agent_memories",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("preference"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("nabeen_agent_memories_owner_created_idx").on(table.ownerId, table.createdAt)],
);

export const insertAgentMemorySchema = createInsertSchema(
  agentMemoriesTable,
).omit({
  createdAt: true,
});

export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type AgentMemoryRecord = typeof agentMemoriesTable.$inferSelect;