import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeChanges?: {
    fileId?: string;
    fileName: string;
    newContent: string;
    action: "create" | "update" | "delete";
  }[];
  timestamp: Date;
  suggestion?: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onApplyChanges?: (changes: ChatMessage["codeChanges"]) => void;
  isLeftSide?: boolean;
}

export function AIChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  onApplyChanges,
  isLeftSide = false,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  if (!isOpen) return null;

  const containerClass = isLeftSide
    ? "flex h-full w-full flex-col bg-background"
    : "fixed right-0 top-0 z-40 flex h-screen w-full md:w-96 flex-col border-l bg-background shadow-lg";

  return (
    <div className={containerClass} data-testid="ai-chat-panel">
      {!isLeftSide && (
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">AI Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            data-testid="button-close-ai-chat"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close AI chat</span>
          </Button>
        </div>
      )}

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-sm mb-2">AI Assistant Ready</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Ask me to create files, modify code, fix bugs, or explain what your code does.
              </p>
              <div className="mt-6 space-y-2 w-full">
                <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                <div className="space-y-1.5">
                  <Badge variant="outline" className="text-xs w-full justify-start">
                    "Create a login page"
                  </Badge>
                  <Badge variant="outline" className="text-xs w-full justify-start">
                    "Add a red button"
                  </Badge>
                  <Badge variant="outline" className="text-xs w-full justify-start">
                    "Explain this code"
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  
                  {message.codeChanges && message.codeChanges.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-semibold opacity-80">
                        Code Changes:
                      </div>
                      {message.codeChanges.map((change, idx) => (
                        <div
                          key={idx}
                          className="rounded-md bg-background/50 p-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {change.action}
                            </Badge>
                            <span className="font-mono">{change.fileName}</span>
                          </div>
                        </div>
                      ))}
                      {onApplyChanges && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full mt-2"
                          onClick={() => onApplyChanges(message.codeChanges)}
                          data-testid={`button-apply-changes-${message.id}`}
                        >
                          Apply Changes
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Ask AI to modify code, create files, fix bugs..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
            data-testid="input-ai-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
