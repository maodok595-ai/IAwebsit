import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Code2, Play, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PreviewFrame } from "@/components/PreviewFrame";
import { AIChatPanel, type ChatMessage } from "@/components/AIChatPanel";
import type { AiChatResponse, File } from "@shared/schema";

const PROJECT_ID = "default";

interface AIWorkspaceProps {
  onSwitchMode: () => void;
}

export default function AIWorkspace({ onSwitchMode }: AIWorkspaceProps) {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: nanoid(),
      role: "assistant",
      content: "Bonjour! Je suis votre assistant de développement IA. Décrivez-moi le site web que vous voulez créer et je vais le construire pour vous.\n\nPar exemple:\n• \"Crée-moi un portfolio moderne avec une page d'accueil\"\n• \"Fais un site de restaurant avec menu et réservations\"\n• \"Un landing page pour une application mobile\"",
      timestamp: new Date(),
    }
  ]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [previewKey, setPreviewKey] = useState(0);

  // Fetch files from backend
  const { data: files = [] } = useQuery({
    queryKey: ["/api/workspace/files", PROJECT_ID],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/files/${PROJECT_ID}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json() as Promise<File[]>;
    },
  });

  // AI Chat mutation
  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest(
        "POST",
        "/api/ai/chat",
        {
          message,
          projectId: PROJECT_ID,
          currentFile: null,
          allFiles: files,
        }
      );
      return response as unknown as AiChatResponse;
    },
    onSuccess: async (data: AiChatResponse) => {
      const aiMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: data.explanation || "Projet créé avec succès!",
        codeChanges: data.codeChanges,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      
      // Apply code changes automatically by calling backend endpoints
      if (data.codeChanges && data.codeChanges.length > 0) {
        try {
          for (const change of data.codeChanges) {
            // Check if file already exists by name
            const existingFile = files.find(f => f.name === change.fileName);
            
            if (change.action === "delete") {
              // Delete file
              const fileToDelete = change.fileId ? files.find(f => f.id === change.fileId) : existingFile;
              if (fileToDelete) {
                await apiRequest("DELETE", `/api/workspace/files/${fileToDelete.id}`, undefined);
              }
            } else if (existingFile) {
              // Update existing file (regardless of action)
              await apiRequest("PATCH", `/api/workspace/files/${existingFile.id}`, {
                content: change.newContent,
              });
            } else {
              // Create new file
              await apiRequest("POST", "/api/workspace/files", {
                projectId: PROJECT_ID,
                name: change.fileName,
                path: `/${change.fileName}`,
                content: change.newContent,
                language: getLanguageFromFileName(change.fileName),
              });
            }
          }
          
          // Refresh file list
          await queryClient.invalidateQueries({ queryKey: ["/api/workspace/files", PROJECT_ID] });
          
          // Auto-refresh preview after AI changes
          setTimeout(() => {
            handleRunCode();
          }, 1500);
          
          toast({
            title: "Projet mis à jour",
            description: `${data.codeChanges.length} fichier(s) modifié(s)`,
          });
        } catch (error) {
          toast({
            title: "Erreur lors de la sauvegarde",
            description: error instanceof Error ? error.message : "Impossible de sauvegarder les fichiers",
            variant: "destructive",
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    aiChatMutation.mutate(message);
  };

  const handleRunCode = () => {
    setConsoleOutput([]);
    setConsoleOutput((prev) => [...prev, "Actualisation du preview..."]);
    setPreviewKey((prev) => prev + 1);
  };

  const getFileContent = (language: string) => {
    const file = files.find((f) => f.language === language);
    return file?.content || "";
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-background px-2 md:px-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <h1 className="text-sm md:text-base font-semibold">
            <span className="hidden sm:inline">CodeStudio - Mode IA</span>
            <span className="sm:hidden">Mode IA</span>
          </h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onSwitchMode}
            data-testid="button-switch-mode"
          >
            <Code2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Mode Éditeur</span>
          </Button>
          
          <Button
            variant="default"
            size="default"
            className="gap-2"
            onClick={handleRunCode}
            data-testid="button-run-code"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* AI Chat Panel - Left side */}
        <div className="flex w-full md:w-[450px] lg:w-[500px] flex-shrink-0 border-r">
          <AIChatPanel
            isOpen={true}
            onClose={() => {}}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={aiChatMutation.isPending}
            onApplyChanges={() => {}}
            isLeftSide={true}
          />
        </div>

        {/* Preview Panel - Right side */}
        <div className="flex-1 flex flex-col">
          <div className="flex h-10 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Aperçu</h2>
              {files.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {files.length} fichier{files.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunCode}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-xs">Actualiser</span>
            </Button>
          </div>
          
          <div className="flex-1">
            <PreviewFrame
              key={previewKey}
              htmlContent={getFileContent("html")}
              cssContent={getFileContent("css")}
              jsContent={getFileContent("javascript")}
              consoleOutput={consoleOutput}
              onRefresh={() => setPreviewKey((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
