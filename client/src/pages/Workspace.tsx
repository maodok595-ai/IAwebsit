import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { FileExplorer, type FileItem } from "@/components/FileExplorer";
import { MonacoEditor } from "@/components/MonacoEditor";
import { PreviewFrame } from "@/components/PreviewFrame";
import { AIChatPanel, type ChatMessage } from "@/components/AIChatPanel";
import type { AiChatResponse, File } from "@shared/schema";

const PROJECT_ID = "default";

export default function Workspace() {
  const { toast } = useToast();
  const [localFiles, setLocalFiles] = useState<Map<string, string>>(new Map());
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [previewKey, setPreviewKey] = useState(0);

  // Fetch files from backend
  const { data: backendFiles = [], isLoading } = useQuery<File[]>({
    queryKey: ["/api/workspace/files", PROJECT_ID],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/files/${PROJECT_ID}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
  });

  // Convert backend files to FileItem format with local edits overlay
  const files: FileItem[] = backendFiles.map(f => ({
    id: f.id,
    name: f.name,
    path: f.path,
    content: localFiles.get(f.id) ?? f.content,
    language: f.language,
  }));

  // Set initial active file
  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files.length, activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId);

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async ({ name, language, content = "" }: { name: string; language: string; content?: string }) => {
      return await apiRequest<File>("POST", "/api/workspace/files", {
        projectId: PROJECT_ID,
        name,
        path: `/${name}`,
        content,
        language,
      });
    },
    onSuccess: (newFile) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace/files", PROJECT_ID] });
      setActiveFileId(newFile.id);
      toast({
        title: "File created",
        description: `${newFile.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create file",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await apiRequest("DELETE", `/api/workspace/files/${fileId}`, undefined);
    },
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace/files", PROJECT_ID] });
      setLocalFiles((prev) => {
        const next = new Map(prev);
        next.delete(fileId);
        return next;
      });
      if (activeFileId === fileId) {
        setActiveFileId(files[0]?.id || null);
      }
      toast({
        title: "File deleted",
        description: "The file has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  // Update file mutation with debouncing
  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      return await apiRequest<File>("PATCH", `/api/workspace/files/${fileId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace/files", PROJECT_ID] });
    },
  });

  const createFile = useCallback((name: string, language: string) => {
    createFileMutation.mutate({ name, language });
  }, [createFileMutation]);

  const deleteFile = useCallback((fileId: string) => {
    deleteFileMutation.mutate(fileId);
  }, [deleteFileMutation]);

  // Optimistic local update followed by backend sync
  const updateFileContent = useCallback((fileId: string, content: string) => {
    // Update local state immediately for responsive editor
    setLocalFiles((prev) => {
      const next = new Map(prev);
      next.set(fileId, content);
      return next;
    });
    
    // Sync to backend (debounced via mutation)
    updateFileMutation.mutate({ fileId, content });
  }, [updateFileMutation]);

  // AI Chat mutation
  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest<AiChatResponse>(
        "POST",
        "/api/ai/chat",
        {
          message,
          projectId: PROJECT_ID,
          currentFile: activeFile,
          allFiles: files,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: data.explanation || "I can help you with that. What would you like me to do?",
        codeChanges: data.codeChanges,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      
      // Apply code changes automatically if provided
      if (data.codeChanges && data.codeChanges.length > 0) {
        data.codeChanges.forEach((change) => {
          if (change.action === "update") {
            const existingFile = files.find((f) => f.id === change.fileId || f.name === change.fileName);
            if (existingFile) {
              updateFileContent(existingFile.id, change.newContent);
            }
          } else if (change.action === "create") {
            const language = change.fileName.endsWith(".html")
              ? "html"
              : change.fileName.endsWith(".css")
              ? "css"
              : change.fileName.endsWith(".js")
              ? "javascript"
              : change.fileName.endsWith(".ts")
              ? "typescript"
              : change.fileName.endsWith(".py")
              ? "python"
              : "javascript";
            
            createFileMutation.mutate({
              name: change.fileName,
              language,
              content: change.newContent,
            });
          }
        });
        
        toast({
          title: "Code updated",
          description: "AI has modified your code.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
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

  const handleApplyChanges = (changes: ChatMessage["codeChanges"]) => {
    if (!changes) return;
    
    changes.forEach((change) => {
      if (change.action === "update") {
        const existingFile = files.find((f) => f.id === change.fileId || f.name === change.fileName);
        if (existingFile) {
          updateFileContent(existingFile.id, change.newContent);
        }
      }
    });
    
    toast({
      title: "Changes applied",
      description: "Code changes have been applied to your files.",
    });
  };

  const handleRunCode = () => {
    setConsoleOutput([]);
    setConsoleOutput((prev) => [...prev, "Running code..."]);
    setPreviewKey((prev) => prev + 1);
    
    toast({
      title: "Code executed",
      description: "Check the preview panel to see the result.",
    });
  };

  const getFileContent = (language: string) => {
    const file = files.find((f) => f.language === language);
    return file?.content || "";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading workspace...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        projectName="CodeStudio Project"
        onRun={handleRunCode}
        onToggleAI={() => setIsAIChatOpen(!isAIChatOpen)}
        isAIOpen={isAIChatOpen}
        isRunning={false}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onCreateFile={createFile}
          onDeleteFile={deleteFile}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col border-r">
            <div className="flex h-10 items-center border-b bg-background px-4">
              <div className="flex items-center gap-2">
                {activeFile && (
                  <div className="text-sm font-medium text-foreground" data-testid="text-active-file">
                    {activeFile.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeFile ? (
                <MonacoEditor
                  value={activeFile.content}
                  onChange={(value) =>
                    updateFileContent(activeFile.id, value || "")
                  }
                  language={activeFile.language}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-sm">No file selected</p>
                    <p className="text-xs mt-2">Create or select a file to start coding</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-[50%]">
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

        <AIChatPanel
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={aiChatMutation.isPending}
          onApplyChanges={handleApplyChanges}
        />
      </div>
    </div>
  );
}
