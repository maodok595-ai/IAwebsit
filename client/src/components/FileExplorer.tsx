import { useState } from "react";
import { File, Folder, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]));

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), newFileLanguage);
      setNewFileName("");
      setNewFileLanguage("javascript");
      setIsCreateDialogOpen(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (language: string) => {
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex h-full flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Files</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-file"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create file</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <div className="mb-2">
            <button
              onClick={() => toggleFolder("root")}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover-elevate"
              data-testid="folder-root"
            >
              {expandedFolders.has("root") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-primary" />
              <span>Project</span>
            </button>
          </div>

          {expandedFolders.has("root") && (
            <div className="pl-4 space-y-1">
              {files.length === 0 ? (
                <div className="px-2 py-6 text-center">
                  <p className="text-xs text-muted-foreground">No files yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click + to create one
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center justify-between rounded-sm hover-elevate"
                    data-testid={`file-item-${file.id}`}
                  >
                    <button
                      onClick={() => onSelectFile(file.id)}
                      className={`flex flex-1 items-center gap-2 px-2 py-1.5 text-sm ${
                        activeFileId === file.id
                          ? "font-semibold text-sidebar-foreground bg-sidebar-accent"
                          : "text-sidebar-foreground"
                      }`}
                    >
                      {getFileIcon(file.language)}
                      <span className="truncate">{file.name}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      data-testid={`button-delete-${file.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete {file.name}</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-create-file">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name and select the language for your new file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">File name</Label>
              <Input
                id="filename"
                placeholder="index.html"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFile();
                  }
                }}
                data-testid="input-filename"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={newFileLanguage} onValueChange={setNewFileLanguage}>
                <SelectTrigger id="language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFile}
              disabled={!newFileName.trim()}
              data-testid="button-create"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
