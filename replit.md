# CodeStudio - AI-Powered Web IDE

## Overview

CodeStudio is a professional web-based Integrated Development Environment (IDE) with integrated AI assistance. The application provides a browser-based coding environment where users can write, edit, and preview HTML, CSS, and JavaScript code in real-time. The platform features an AI assistant powered by OpenAI that can help with code generation, debugging, and project modifications through natural language commands.

The application is designed as a productivity-focused coding platform, drawing inspiration from Replit, VS Code, and Linear for its modern, clean interface and developer-centric experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theming system
- **Code Editor**: Monaco Editor (VS Code's editor) via @monaco-editor/react

**Design System:**
The application uses a comprehensive design system based on the "new-york" style from shadcn/ui with:
- Custom color palette with HSL-based theme variables
- Support for light/dark themes with automatic theme switching
- Tailwind spacing units (2, 3, 4, 6, 8) for consistent layouts
- Custom border radius values (sm: 3px, md: 6px, lg: 9px)
- Typography using Inter for UI text and JetBrains Mono for code
- Elevation system using semi-transparent overlays for hover/active states

**Layout Structure:**
The workspace follows a multi-panel layout:
- Fixed header (h-14) with project info and action buttons
- Collapsible sidebar (w-64, collapsible to w-12) for file explorer
- Flexible editor panel (flex-1, min-w-400px) with Monaco editor
- Flexible preview panel (flex-1, min-w-400px) with live code preview
- Slide-in AI chat panel (w-96) from the right edge

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and API routes
- **Development**: tsx for TypeScript execution during development
- **Build**: esbuild for production bundling

**API Design:**
RESTful API with the following key endpoints:
- `/api/workspace/files/:projectId` - File management (GET files by project)
- `/api/ai/chat` - AI assistant chat interface (POST)
- `/api/execute` - Code execution endpoint (POST)

**Request/Response Pattern:**
- Uses Zod schemas for request validation
- Structured JSON responses with proper error handling
- Session-based request logging with timing information

### Data Storage

**Database:**
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via @neondatabase/serverless)
- **Migrations**: Managed through drizzle-kit

**Schema Design:**
Three main tables:
1. **projects** - Project metadata (id, name, description)
2. **files** - File contents (id, projectId, name, path, content, language)
3. **ai_messages** - AI conversation history (id, projectId, role, content, timestamp, metadata)

**In-Memory Fallback:**
The application includes a MemStorage implementation that stores data in memory as a fallback when database is not available. This provides:
- Map-based storage for projects and files
- Default project with welcome files
- Compatible interface with database storage

### AI Integration

**Provider:**
- Uses Replit's AI Integrations service (OpenAI-compatible API)
- Configured via environment variables (AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY)
- Default model: "gpt-5" (latest as of August 2025)

**AI Capabilities:**
The AI assistant can:
- Understand context from current file and all project files
- Generate code explanations and suggestions
- Perform CRUD operations on files (create, update, delete)
- Provide structured responses with code changes in JSON format

**Context Building:**
When processing AI requests, the system:
- Includes current file name, language, and content
- Lists all project files for broader context
- Formats responses with explanation, code changes, and suggestions

### Code Execution

**Client-Side Execution:**
Code runs in an isolated iframe:
- Combines HTML, CSS, and JavaScript files
- Provides real-time preview updates
- Captures console output and errors
- Uses sandboxed iframe for security

**Preview System:**
- Tabs for switching between preview and console output
- Automatic iframe refresh on code changes
- Error boundary handling for runtime errors

### External Dependencies

**Third-Party Services:**
- **Replit AI Integrations**: OpenAI-compatible API for AI features
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Inter and JetBrains Mono font families

**Key NPM Packages:**
- **@monaco-editor/react**: Code editor component
- **@tanstack/react-query**: Data fetching and caching
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: PostgreSQL client
- **express**: Backend HTTP server
- **zod**: Schema validation
- **wouter**: Client-side routing
- **date-fns**: Date formatting
- **nanoid**: Unique ID generation
- **Radix UI**: Headless UI component primitives (accordion, dialog, dropdown, etc.)
- **class-variance-authority**: Component variant styling
- **tailwindcss**: Utility-first CSS framework

**Development Tools:**
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **esbuild**: Production bundling
- **drizzle-kit**: Database migration tool
- **@replit/vite-plugin-***: Replit-specific development plugins (error overlay, cartographer, dev banner)

### Session Management

**Implementation:**
- Uses connect-pg-simple for PostgreSQL-backed sessions
- Express session middleware for maintaining user state
- Cookie-based session tracking

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: AI service endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY`: AI service authentication
- `NODE_ENV`: Environment mode (development/production)
- `REPL_ID`: Replit instance identifier (optional, for Replit-specific features)

### Build and Deployment

**Development Mode:**
- Vite dev server with HMR (Hot Module Replacement)
- Express middleware mode for API integration
- Automatic TypeScript compilation

**Production Build:**
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles server code to `dist`
- Static file serving from production build
- ESM module format throughout