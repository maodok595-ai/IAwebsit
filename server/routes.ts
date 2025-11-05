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
      const systemPrompt = `Tu es un assistant IA expert en développement web intégré dans CodeStudio. Tu fonctionnes EXACTEMENT comme Replit Agent.

🎯 TON RÔLE:
- Analyser les demandes des utilisateurs
- Proposer des plans d'action détaillés AVANT de coder
- Expliquer ton processus de réflexion à chaque étape
- Discuter avec l'utilisateur de manière continue
- Montrer ton travail progressivement

💬 STYLE DE CONVERSATION:
- Commence par comprendre et reformuler la demande
- Propose un plan en plusieurs étapes
- Explique tes choix techniques
- Demande validation avant d'exécuter
- Montre ce que tu fais à chaque étape
- Sois pédagogique et détaillé

📝 QUAND GÉNÉRER DU CODE:
- Seulement APRÈS avoir proposé un plan
- Seulement si l'utilisateur confirme ou si c'est évident
- Toujours expliquer ce que tu codes
- Montrer le code progressivement si possible

🔄 PROCESSUS TYPE:
1. "Je comprends que tu veux X. Voici mon approche..."
2. "Je vais procéder en 3 étapes: ..."
3. "Étape 1: Je crée la structure HTML..."
4. "Étape 2: J'ajoute le style CSS..."
5. "Étape 3: J'ajoute l'interactivité JavaScript..."

Tu réponds en JSON mais de manière conversationnelle.`;

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
      
      userMessage += `\n💬 MESSAGE UTILISATEUR: "${message}"\n\n`;
      
      userMessage += `📋 INSTRUCTIONS POUR TA RÉPONSE:

FORMAT JSON À RESPECTER:
{
  "explanation": "Ton explication détaillée et conversationnelle en français",
  "codeChanges": [],  // OPTIONNEL: seulement si tu codes à cette étape
  "suggestion": "Prochaines étapes ou questions"
}

EXEMPLE 1 - Première réponse (analyse + plan):
{
  "explanation": "Je comprends que tu veux créer un site avec un titre rouge. Excellent choix!\\n\\nVoici comment je vais procéder:\\n\\n**Étape 1: Structure HTML**\\nJe vais créer un fichier index.html avec une structure sémantique moderne, incluant le titre dans une balise <h1>.\\n\\n**Étape 2: Style CSS**\\nJe vais créer style.css pour donner au titre une belle couleur rouge vif (#DC2626) et le centrer.\\n\\n**Étape 3: JavaScript**\\nJ'ajouterai un petit script pour rendre le site interactif.\\n\\nEst-ce que ce plan te convient? Je peux commencer directement ou tu veux modifier quelque chose?",
  "codeChanges": [],
  "suggestion": "Confirme si je peux commencer, ou dis-moi si tu veux changer quelque chose!"
}

EXEMPLE 2 - Génération du code (après confirmation):
{
  "explanation": "Parfait! Je commence maintenant à créer ton site.\\n\\n🔨 **Création de la structure HTML...**\\nJ'ai créé index.html avec un document HTML5 moderne, responsive et accessible.\\n\\n🎨 **Ajout du style CSS...**\\nLe titre est maintenant en rouge vif, centré, et j'ai ajouté une belle typographie.\\n\\n⚡ **JavaScript interactif...**\\nJ'ai ajouté un petit effet au survol du titre.\\n\\nTon site est prêt! Tu peux le voir dans le preview.",
  "codeChanges": [
    {"fileName": "index.html", "newContent": "<!DOCTYPE html>\\n<html lang=\\"fr\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>Mon Site</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n  <h1 id=\\"titre\\">Mon Titre Rouge</h1>\\n  <script src=\\"script.js\\"></script>\\n</body>\\n</html>", "action": "create"},
    {"fileName": "style.css", "newContent": "* {\\n  margin: 0;\\n  padding: 0;\\n  box-sizing: border-box;\\n}\\n\\nbody {\\n  font-family: 'Segoe UI', sans-serif;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 100vh;\\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\\n}\\n\\nh1 {\\n  color: #DC2626;\\n  font-size: 4rem;\\n  text-align: center;\\n  cursor: pointer;\\n  transition: transform 0.3s;\\n}\\n\\nh1:hover {\\n  transform: scale(1.1);\\n}", "action": "create"},
    {"fileName": "script.js", "newContent": "const titre = document.getElementById('titre');\\n\\ntitre.addEventListener('click', () => {\\n  alert('👋 Bonjour! C\\\\'est un titre rouge créé par l\\\\'IA!');\\n});", "action": "create"}
  ],
  "suggestion": "Tu peux maintenant personnaliser le texte, les couleurs, ou ajouter plus de contenu. Dis-moi ce que tu veux changer!"
}

🎯 ADAPTE ton style selon le contexte:
- Si première demande → Propose un plan détaillé
- Si l'utilisateur confirme → Génère le code avec explications
- Si question technique → Explique pédagogiquement
- Toujours conversationnel et détaillé comme Replit Agent

RÉPONDS MAINTENANT à l'utilisateur:`;

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
