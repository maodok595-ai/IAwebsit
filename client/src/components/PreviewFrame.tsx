import { useEffect, useRef, useState } from "react";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreviewFrameProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  consoleOutput: string[];
  onRefresh: () => void;
}

export function PreviewFrame({
  htmlContent,
  cssContent,
  jsContent,
  consoleOutput,
  onRefresh,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    if (iframeRef.current && activeTab === "preview") {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${cssContent}</style>
</head>
<body>
  ${htmlContent}
  <script>
    window.addEventListener('error', function(e) {
      console.error('Error:', e.message);
    });
    ${jsContent}
  </script>
</body>
</html>`;
        doc.open();
        doc.write(fullHtml);
        doc.close();
      }
    }
  }, [htmlContent, cssContent, jsContent, activeTab]);

  return (
    <div className={`flex h-full flex-col border-l bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold">Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            data-testid="button-refresh-preview"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh preview</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-10 bg-transparent px-4">
          <TabsTrigger value="preview" className="data-[state=active]:bg-accent" data-testid="tab-preview">
            Preview
          </TabsTrigger>
          <TabsTrigger value="console" className="data-[state=active]:bg-accent" data-testid="tab-console">
            Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 m-0 p-0">
          <iframe
            ref={iframeRef}
            title="Preview"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            data-testid="preview-iframe"
          />
        </TabsContent>

        <TabsContent value="console" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 font-mono text-sm space-y-2" data-testid="console-output">
              {consoleOutput.length === 0 ? (
                <div className="text-muted-foreground italic">
                  Console output will appear here
                </div>
              ) : (
                consoleOutput.map((line, index) => (
                  <div
                    key={index}
                    className="py-1 text-xs leading-relaxed"
                    data-testid={`console-line-${index}`}
                  >
                    <span className="text-muted-foreground mr-2">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
