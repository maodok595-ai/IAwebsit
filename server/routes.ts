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

      // Build context for the AI - detailed like Replit Agent
      const systemPrompt = `Tu es un assistant IA expert en développement web, intégré dans CodeStudio IDE. Tu fonctionnes comme Replit Agent - tu es conversationnel, détaillé et tu montres ton processus de réflexion.

PERSONNALITÉ:
- Conversationnel et amical
- Explique clairement ce que tu fais et pourquoi
- Montre ton raisonnement étape par étape
- Pose des questions de clarification si nécessaire
- Donne des suggestions pour améliorer le projet

CAPACITÉS:
- Créer des sites web complets avec HTML, CSS, JavaScript
- Modifier des fichiers existants
- Expliquer le code généré
- Proposer des améliorations
- Déboguer les problèmes

STYLE DE RÉPONSE:
- Commence par expliquer ce que tu vas faire
- Décris brièvement ton approche
- Génère le code nécessaire
- Explique les choix techniques importants
- Propose des prochaines étapes

Tu dois TOUJOURS répondre en JSON avec cette structure exacte.`;

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
      
      userMessage += `\nDEMANDE DE L'UTILISATEUR:\n"${message}"\n\n`;
      
      userMessage += `INSTRUCTIONS DE RÉPONSE:
1. Dans "explanation": Explique en français ce que tu vas créer/modifier, ton approche, et pourquoi tu fais ces choix. Sois détaillé et conversationnel comme Replit Agent.

2. Dans "codeChanges": Fournis le code complet pour chaque fichier. Actions disponibles:
   - "create": Créer un nouveau fichier
   - "update": Modifier un fichier existant
   - "delete": Supprimer un fichier

3. Dans "suggestion": Propose des améliorations ou prochaines étapes

RÈGLES IMPORTANTES:
- Fournis TOUJOURS le contenu COMPLET des fichiers (pas de snippets)
- Pour un site web complet: crée index.html, style.css, et script.js
- Code moderne, responsive, et professionnel
- Si tu modifies un fichier existant, utilise "update" avec le nom exact du fichier
- Échappe correctement les caractères JSON (\\n pour nouvelles lignes, \\" pour guillemets)

FORMAT DE RÉPONSE (JSON obligatoire):
{
  "explanation": "Explication détaillée et conversationnelle en français de ce que tu fais",
  "codeChanges": [
    {
      "fileName": "index.html",
      "newContent": "<!DOCTYPE html>\\n<html>...code complet...",
      "action": "create"
    }
  ],
  "suggestion": "Suggestions pour continuer"
}`;

      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
        temperature: 0.7,
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
