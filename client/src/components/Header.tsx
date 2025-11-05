import { Play, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  projectName: string;
  onRun: () => void;
  onToggleAI: () => void;
  isAIOpen: boolean;
  isRunning: boolean;
}

export function Header({ projectName, onRun, onToggleAI, isAIOpen, isRunning }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-base font-semibold" data-testid="text-project-name">
            {projectName}
          </h1>
        </div>
        <Badge variant="secondary" className="text-xs">
          Beta
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="default"
          className="gap-2 font-medium"
          onClick={onRun}
          disabled={isRunning}
          data-testid="button-run-code"
        >
          <Play className="h-4 w-4" />
          Run Code
        </Button>
        
        <Button
          variant={isAIOpen ? "default" : "outline"}
          size="default"
          className="gap-2"
          onClick={onToggleAI}
          data-testid="button-toggle-ai"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
