import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import ModeSelection from "@/pages/ModeSelection";
import AIWorkspace from "@/pages/AIWorkspace";
import Workspace from "@/pages/Workspace";

type WorkMode = "selection" | "ai" | "manual";

function App() {
  const [mode, setMode] = useState<WorkMode>(() => {
    const savedMode = localStorage.getItem("codestudio-mode");
    return (savedMode as WorkMode) || "selection";
  });

  useEffect(() => {
    if (mode !== "selection") {
      localStorage.setItem("codestudio-mode", mode);
    }
  }, [mode]);

  const handleSelectMode = (selectedMode: "ai" | "manual") => {
    setMode(selectedMode);
  };

  const handleSwitchMode = () => {
    setMode("selection");
    localStorage.removeItem("codestudio-mode");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {mode === "selection" && <ModeSelection onSelectMode={handleSelectMode} />}
          {mode === "ai" && <AIWorkspace onSwitchMode={handleSwitchMode} />}
          {mode === "manual" && <Workspace onSwitchMode={handleSwitchMode} />}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
