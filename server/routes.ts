import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openai, DEFAULT_MODEL } from "./lib/openai";
import { aiChatRequestSchema, aiChatResponseSchema, executeCodeRequestSchema } from "@shared/schema";
import type { AiChatResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Chat endpoint - handles natural language commands
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const validated = aiChatRequestSchema.parse(req.body);
      const { message, projectId, currentFile, allFiles } = validated;

      // Build context for the AI
      let contextMessage = `You are an expert web development AI assistant in CodeStudio IDE. You can create complete websites from natural language descriptions.

CURRENT PROJECT STATE:`;
      
      if (allFiles && allFiles.length > 0) {
        contextMessage += `\nExisting files:`;
        allFiles.forEach((file) => {
          contextMessage += `\n- ${file.name} (${file.language}, ${file.content.length} chars)`;
        });
      } else {
        contextMessage += `\nNo files yet - new project.`;
      }
      
      if (currentFile) {
        contextMessage += `\n\nCurrently viewing: ${currentFile.name}\n\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\``;
      }
      
      contextMessage += `\n\nUSER REQUEST: "${message}"`;
      
      contextMessage += `\n\nYOUR MISSION:
- If user asks for a complete website/app, create ALL files (HTML, CSS, JavaScript)
- Generate professional, production-ready, responsive code
- Use modern best practices (semantic HTML5, flexbox/grid CSS, clean JS)
- Include COMPLETE working code - no placeholders
- For simple requests, modify only relevant files

RESPONSE FORMAT (JSON):
{
  "explanation": "Brief description of what you created",
  "codeChanges": [
    {"fileName": "index.html", "newContent": "full HTML here", "action": "create"},
    {"fileName": "style.css", "newContent": "full CSS here", "action": "create"},
    {"fileName": "script.js", "newContent": "full JS here", "action": "create"}
  ],
  "suggestion": "Optional next steps"
}

ACTIONS: "create" (new file), "update" (existing file), "delete"
IMPORTANT: Provide COMPLETE file contents, generate beautiful functional code.`;


      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful coding assistant. Always respond with valid JSON matching the requested structure. Be concise and practical."
          },
          {
            role: "user",
            content: contextMessage
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const responseContent = completion.choices[0]?.message?.content || "{}";
      let aiResponse: AiChatResponse;
      
      try {
        const parsed = JSON.parse(responseContent);
        
        // Ensure codeChanges have proper structure
        if (parsed.codeChanges) {
          parsed.codeChanges = parsed.codeChanges.map((change: any) => ({
            fileId: change.fileId || currentFile?.id || 'new',
            fileName: change.fileName || currentFile?.name || 'untitled.txt',
            newContent: change.newContent || '',
            action: change.action || 'update'
          }));
        }
        
        aiResponse = parsed;
      } catch (e) {
        // Fallback if JSON parsing fails
        aiResponse = {
          explanation: responseContent,
          codeChanges: [],
        };
      }

      res.json(aiResponse);
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({
        explanation: error instanceof Error ? error.message : "An error occurred",
        codeChanges: [],
      });
    }
  });

  // Get all files for a project
  app.get("/api/workspace/files/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const files = await storage.getFilesByProject(projectId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Create a new file
  app.post("/api/workspace/files", async (req, res) => {
    try {
      const file = await storage.createFile(req.body);
      res.json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  // Update file content
  app.patch("/api/workspace/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const file = await storage.updateFile(id, content);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Delete a file
  app.delete("/api/workspace/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFile(id);
      
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Execute code (for future implementation)
  app.post("/api/workspace/execute", async (req, res) => {
    try {
      const validated = executeCodeRequestSchema.parse(req.body);
      
      // For MVP, we'll just return a success message
      // In a full implementation, this would execute the code in a sandbox
      res.json({
        success: true,
        output: "Code execution is handled in the browser preview",
      });
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
