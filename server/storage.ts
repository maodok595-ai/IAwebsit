import { randomUUID } from "crypto";
import type { Project, InsertProject, File, InsertFile } from "@shared/schema";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Files
  getFile(id: string): Promise<File | undefined>;
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, content: string): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private files: Map<string, File>;

  constructor() {
    this.projects = new Map();
    this.files = new Map();
    
    // Create default project
    const defaultProject: Project = {
      id: "default",
      name: "My Project",
      description: "Default project",
    };
    this.projects.set(defaultProject.id, defaultProject);

    // Create welcome files
    const welcomeHtml: File = {
      id: randomUUID(),
      projectId: "default",
      name: "index.html",
      path: "/index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CodeStudio</title>
</head>
<body>
  <div class="container">
    <h1>Welcome to CodeStudio!</h1>
    <p>Start coding or ask the AI assistant for help.</p>
    <button id="testBtn">Click me!</button>
  </div>
</body>
</html>`,
      language: "html",
    };

    const welcomeCss: File = {
      id: randomUUID(),
      projectId: "default",
      name: "style.css",
      path: "/style.css",
      content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.container {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #ddd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

button {
  background: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
}`,
      language: "css",
    };

    const welcomeJs: File = {
      id: randomUUID(),
      projectId: "default",
      name: "script.js",
      path: "/script.js",
      content: `document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('testBtn');
  
  button.addEventListener('click', function() {
    alert('Hello from CodeStudio! 🚀\\n\\nTry asking the AI to modify this code!');
  });
  
  console.log('CodeStudio initialized successfully!');
});`,
      language: "javascript",
    };

    this.files.set(welcomeHtml.id, welcomeHtml);
    this.files.set(welcomeCss.id, welcomeCss);
    this.files.set(welcomeJs.id, welcomeJs);
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  // Files
  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = { ...insertFile, id };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, content: string): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile: File = { ...file, content };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
