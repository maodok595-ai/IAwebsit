import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { anthropic, DEFAULT_MODEL } from "./lib/openai";
import { aiChatRequestSchema, aiChatResponseSchema, executeCodeRequestSchema } from "@shared/schema";
import type { AiChatResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Chat endpoint - conversational like Replit Agent
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const validated = aiChatRequestSchema.parse(req.body);
      const { message, projectId, currentFile, allFiles, conversationHistory } = validated;

      // System prompt optimized for Claude (Replit Agent's model)
      const systemPrompt = `Tu es un assistant de code. Ta SEULE tâche: GÉNÉRER DU CODE HTML/CSS/JS.

COMPORTEMENT REQUIS:
- TOUJOURS générer au moins 3 fichiers: index.html, style.css, script.js
- JAMAIS proposer un plan - CODE DIRECTEMENT
- Code complet et fonctionnel dans chaque fichier

FORMAT JSON STRICT (PAS DE MARKDOWN):
{
  "explanation": "Description brève",
  "codeChanges": [
    {"fileName":"index.html","newContent":"CODE ÉCHAPPÉ","action":"create"},
    {"fileName":"style.css","newContent":"CODE ÉCHAPPÉ","action":"create"},
    {"fileName":"script.js","newContent":"CODE ÉCHAPPÉ","action":"create"}
  ],
  "suggestion":"Amélioration possible"
}

OBLIGATOIRE: codeChanges DOIT contenir 3+ fichiers`;

      let userMessage = `ÉTAT ACTUEL DU PROJET:\n`;
      
      if (allFiles && allFiles.length > 0) {
        userMessage += `Fichiers existants:\n`;
        allFiles.forEach((file) => {
          userMessage += `- ${file.name} (${file.language}, ${file.content.length} caractères)\n`;
        });
      } else {
        userMessage += `Nouveau projet - aucun fichier pour le moment.\n`;
      }
      
      if (currentFile) {
        userMessage += `\nFichier actuellement ouvert: ${currentFile.name}\n\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\`\n`;
      }
      
      userMessage += `\n\nDEMANDE: ${message}\n\n`;
      userMessage += `GÉNÈRE 3 FICHIERS. Réponds EN JSON PUR (pas de markdown).

RÈGLES D'ÉCHAPPEMENT CRITIQUES:
- Dans JavaScript: TOUJOURS utiliser quotes simples ' au lieu de "
- Exemple JS: console.log('bonjour'); PAS console.log("bonjour");
- Remplace \\n par \\\\n dans newContent
- Remplace " par \\\\" dans newContent HTML

FORMAT EXACT:
{"explanation":"Site créé","codeChanges":[{"fileName":"index.html","newContent":"<!DOCTYPE html>\\\\n<html>\\\\n<head><title>Site</title></head>\\\\n<body><h1>Titre</h1></body>\\\\n</html>","action":"create"},{"fileName":"style.css","newContent":"body{margin:0}","action":"create"},{"fileName":"script.js","newContent":"console.log('hello');","action":"create"}],"suggestion":"ok"}

Réponds JSON maintenant:`;

      // Build conversation history for Claude (Anthropic API)
      const messages: any[] = [];

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach((msg: any) => {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.role === "user" ? msg.content : JSON.stringify({
              explanation: msg.content,
              codeChanges: msg.codeChanges || [],
              suggestion: msg.suggestion || ""
            })
          });
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: userMessage
      });

      // Call Claude (the same AI as Replit Agent!)
      const completion = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        system: systemPrompt, // Claude uses separate system parameter
        messages: messages,
      });

      let responseContent = completion.content[0]?.type === "text" 
        ? completion.content[0].text 
        : "{}";
      
      console.log("=== CLAUDE RAW RESPONSE ===");
      console.log(responseContent);
      console.log("==========================");
      
      // Claude often wraps JSON in markdown code blocks - extract it
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        responseContent = jsonMatch[1].trim();
        console.log("Extracted JSON from markdown code block");
      }
      
      let aiResponse: AiChatResponse;
      
      try {
        const parsed = JSON.parse(responseContent);
        
        // Ensure codeChanges have proper structure
        if (parsed.codeChanges && Array.isArray(parsed.codeChanges)) {
          parsed.codeChanges = parsed.codeChanges.map((change: any) => ({
            fileId: change.fileId || undefined,
            fileName: change.fileName || 'untitled.txt',
            newContent: change.newContent || '',
            action: change.action || 'create'
          }));
        } else {
          // If no codeChanges provided, initialize empty array
          parsed.codeChanges = [];
        }
        
        aiResponse = parsed;
        console.log("Parsed AI response with", parsed.codeChanges?.length || 0, "code changes");
      } catch (e) {
        console.error("Failed to parse AI response:", e);
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
