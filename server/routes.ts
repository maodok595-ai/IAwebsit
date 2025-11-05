import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openai, DEFAULT_MODEL } from "./lib/openai";
import { aiChatRequestSchema, aiChatResponseSchema, executeCodeRequestSchema } from "@shared/schema";
import type { AiChatResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Chat endpoint - conversational like Replit Agent
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const validated = aiChatRequestSchema.parse(req.body);
      const { message, projectId, currentFile, allFiles, conversationHistory } = validated;

      // Build context for conversational AI like Replit Agent
      const systemPrompt = `Tu es un assistant IA de développement web expert. Tu travailles comme Replit Agent.

COMPORTEMENT:
1. Analyse la demande de l'utilisateur
2. Propose un plan d'action détaillé en français
3. Explique ton processus étape par étape
4. Génère le code complet quand tu codes

Tu réponds TOUJOURS en JSON avec ce format:
{
  "explanation": "Explication détaillée en français",
  "codeChanges": [tableau de fichiers - OBLIGATOIRE si tu codes],
  "suggestion": "Prochaines étapes"
}

RÈGLE CRITIQUE: Si tu génères du code, tu DOIS le mettre dans codeChanges.`;

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
      
      userMessage += `\n💬 DEMANDE: "${message}"\n\n`;
      
      userMessage += `INSTRUCTIONS:
- Réponds en JSON avec explanation, codeChanges (tableau), et suggestion
- Dans explanation: explique ton approche en français de manière détaillée
- Si tu codes: OBLIGATOIRE de mettre le code complet dans codeChanges
- Si tu proposes juste un plan: codeChanges peut être vide []

EXEMPLE (création de site):
{
  "explanation": "Je vais créer un site avec un bouton bleu.\\n\\nÉtape 1: Structure HTML\\nÉtape 2: Style CSS avec bouton bleu\\nÉtape 3: JavaScript pour interaction",
  "codeChanges": [
    {"fileName": "index.html", "newContent": "<!DOCTYPE html>...", "action": "create"},
    {"fileName": "style.css", "newContent": "body {...}", "action": "create"},
    {"fileName": "script.js", "newContent": "...", "action": "create"}
  ],
  "suggestion": "Tu peux changer la couleur du bouton si tu veux."
}

Réponds maintenant:`;

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: systemPrompt
        }
      ];

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

      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: messages,
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const responseContent = completion.choices[0]?.message?.content || "{}";
      console.log("=== AI RESPONSE ===");
      console.log(responseContent);
      console.log("==================");
      
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
