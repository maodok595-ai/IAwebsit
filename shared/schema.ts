import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull().default(""),
  language: text("language").notNull().default("javascript"),
});

export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  metadata: jsonb("metadata"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true });
export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({ id: true, timestamp: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;

export const aiChatRequestSchema = z.object({
  message: z.string().min(1),
  projectId: z.string(),
  currentFile: z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    language: z.string(),
  }).nullable().optional(),
  allFiles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    content: z.string(),
    language: z.string(),
  })).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    codeChanges: z.array(z.object({
      fileName: z.string(),
      newContent: z.string(),
      action: z.enum(['create', 'update', 'delete']),
    })).optional(),
    suggestion: z.string().optional(),
  })).optional(),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export const aiChatResponseSchema = z.object({
  explanation: z.string(),
  codeChanges: z.array(z.object({
    fileId: z.string().optional(),
    fileName: z.string(),
    newContent: z.string(),
    action: z.enum(['create', 'update', 'delete']),
  })).optional(),
  suggestion: z.string().optional(),
});

export type AiChatResponse = z.infer<typeof aiChatResponseSchema>;

export const executeCodeRequestSchema = z.object({
  code: z.string(),
  language: z.string(),
});

export type ExecuteCodeRequest = z.infer<typeof executeCodeRequestSchema>;
