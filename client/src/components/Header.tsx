import { Play, Sparkles, Code2, Menu, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  projectName: string;
  onRun: () => void;
  onToggleAI: () => void;
  isAIOpen: boolean;
  isRunning: boolean;
  onToggleFiles?: () => void;
  isFilesOpen?: boolean;
}

export function Header({ 
  projectName, 
  onRun, 
  onToggleAI, 
  isAIOpen, 
  isRunning,
  onToggleFiles,
  isFilesOpen = true,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-2 md:px-4">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile file explorer toggle */}
        {onToggleFiles && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggleFiles}
            data-testid="button-toggle-files"
          >
            {isFilesOpen ? <FolderOpen className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle files</span>
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <h1 className="text-sm md:text-base font-semibold" data-testid="text-project-name">
            <span className="hidden sm:inline">{projectName}</span>
            <span className="sm:hidden">CodeStudio</span>
          </h1>
        </div>
        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
          Beta
        </Badge>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="default"
          size="default"
          className="gap-2 font-medium"
          onClick={onRun}
          disabled={isRunning}
          data-testid="button-run-code"
        >
          <Play className="h-4 w-4" />
          <span className="hidden sm:inline">Run Code</span>
          <span className="sm:hidden">Run</span>
        </Button>
        
        <Button
          variant={isAIOpen ? "default" : "outline"}
          size="default"
          className="gap-2"
          onClick={onToggleAI}
          data-testid="button-toggle-ai"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">AI Assistant</span>
          <span className="sm:hidden">AI</span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
