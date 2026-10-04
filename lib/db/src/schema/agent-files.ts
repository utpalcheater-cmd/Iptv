import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { agentProjectsTable } from "./agent-projects";

export const agentFilesTable = pgTable(
  "nabeen_agent_files",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => agentProjectsTable.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    objectPath: text("object_path").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("nabeen_agent_files_project_path_uq").on(
      table.projectId,
      table.path,
    ),
    index("nabeen_agent_files_owner_project_idx").on(
      table.ownerId,
      table.projectId,
    ),
  ],
);

export const insertAgentFileSchema = createInsertSchema(agentFilesTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentFile = z.infer<typeof insertAgentFileSchema>;
export type AgentFileRecord = typeof agentFilesTable.$inferSelect;