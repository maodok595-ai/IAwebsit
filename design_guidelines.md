# Design Guidelines: Professional Web-Based IDE Platform

## Design Approach

**Reference-Based Approach:** Drawing inspiration from Replit, VS Code, and Linear for a modern, productivity-focused IDE experience. This is a utility-focused application where efficiency, clarity, and usability are paramount.

**Core Principles:**
- Information density without clutter
- Instant visual hierarchy for different UI zones
- Minimal cognitive load for developers
- Professional, technical aesthetic
- Functional over decorative

---

## Layout System

**Spacing Units:** Use Tailwind spacing of `2, 3, 4, 6, 8` for consistency
- Micro spacing (gaps, padding): `p-2`, `gap-3`
- Component spacing: `p-4`, `m-4`
- Section spacing: `p-6`, `p-8`

**Grid Structure:**
```
┌─────────────────────────────────────────────┐
│ Header (h-14)                               │
├──────┬──────────────────────┬───────────────┤
│      │                      │               │
│ Side │   Editor Panel       │ Preview/      │
│ bar  │   (Monaco Editor)    │ Output        │
│      │                      │ Panel         │
│(w-64)│   (flex-1)           │ (flex-1)      │
│      │                      │               │
└──────┴──────────────────────┴───────────────┘
```

**Panel Dimensions:**
- Header: Fixed `h-14`
- Sidebar: Fixed `w-64` (collapsible to `w-12` icon-only mode)
- Editor: `flex-1` with `min-w-[400px]`
- Preview: `flex-1` with `min-w-[400px]`
- AI Chat Panel: Slide-in overlay `w-96` from right edge

---

## Typography

**Font Stack:**
- **Code:** `'Fiona Code', 'JetBrains Mono', 'Courier New', monospace` via Google Fonts
- **UI Text:** `'Inter', system-ui, sans-serif` via Google Fonts

**Type Scale:**
- Headers: `text-base font-semibold` (14px, 600 weight)
- Body: `text-sm` (13px) for UI elements
- Code: `text-sm font-mono` (13px) for editor
- Small/Meta: `text-xs` (12px) for file sizes, timestamps
- Tiny: `text-[11px]` for status indicators

---

## Component Library

### Header Component
- Full width with `px-4 py-3`
- Left section: Logo/project name (`text-base font-semibold`)
- Center: Breadcrumb navigation showing current file path (`text-sm`)
- Right section: Run button (primary action), theme toggle, user avatar
- Run button: `px-6 py-2 rounded-md font-medium` with icon

### Sidebar Navigation
**File Explorer Section:**
- Tree structure with `pl-4` indentation per level
- File items: `h-8 px-3 rounded-sm` hover target
- Icons: 16px from Heroicons (folder, file type specific)
- Folder expand/collapse chevron on left
- File names: `text-sm truncate`

**Git Panel Section:**
- Collapsible accordion with `h-9` header
- Commit list with `py-2 px-3` per item
- Commit message: `text-sm font-medium`
- Timestamp/author: `text-xs`

**AI Agent Panel Section:**
- Fixed button at bottom of sidebar
- Badge showing "AI Agent" with pulse indicator when active

### Monaco Editor Container
- Full height with `border-l border-r` for visual separation
- Tab bar at top (`h-10`) for open files
- File tabs: `px-4 h-10 text-sm` with close icon
- Active tab indicator: bottom border `border-b-2`
- Editor area: `min-h-0 flex-1` for proper scrolling

### Preview/Output Panel
**Preview Mode (iframe):**
- Top toolbar (`h-10`) with refresh button, device size toggles, URL bar
- Iframe: `w-full h-full border-0`

**Console Mode:**
- Console output with `p-4 font-mono text-sm`
- Each log entry: `py-1` with timestamp prefix
- Error messages: Bold with error icon
- Clear console button in toolbar

### AI Chat Interface
**Slide-in Panel:**
- Fixed width `w-96` sliding from right
- Header: `h-14 px-4` with "AI Agent" title and close button
- Chat history: `flex-1 overflow-y-auto p-4 space-y-4`
- Message bubbles:
  - User: `max-w-[80%] ml-auto px-4 py-3 rounded-2xl rounded-br-sm`
  - AI: `max-w-[80%] mr-auto px-4 py-3 rounded-2xl rounded-bl-sm`
- Input area: `h-24 p-4 border-t`
- Input field: `w-full h-12 px-4 rounded-lg` with send button inside

**AI Response Format:**
- Action summary: `text-sm font-medium mb-2`
- Code blocks: Monaco-style syntax highlighting in `rounded-md p-3`
- Explanation text: `text-sm leading-relaxed`

### Modals & Overlays
**Create File Modal:**
- Centered overlay `max-w-md w-full p-6 rounded-lg`
- Title: `text-lg font-semibold mb-4`
- Input fields: `h-10 px-3 rounded-md w-full`
- Button group: `flex gap-3 mt-6 justify-end`

**Settings Panel:**
- Slide-in from right `w-96`
- Grouped sections with `space-y-6`
- Toggle switches for preferences
- Dropdown selects for theme, font size

---

## Responsive Behavior

**Desktop (1024px+):** Full three-panel layout as shown
**Tablet (768px-1023px):** 
- Sidebar collapses to icon-only `w-12`
- Preview/output becomes bottom panel `h-64` below editor
**Mobile (<768px):**
- Single panel view with tab switching
- Bottom toolbar for panel navigation
- Sidebar becomes full-screen overlay when opened

---

## Interactions & States

**Panel Resizing:**
- Draggable dividers between panels (4px wide hit area)
- Cursor changes to `resize-horizontal` on hover
- Smooth transitions with `transition-all duration-150`

**File Tree:**
- Hover states: Subtle highlight
- Active file: Bold font weight and indicator
- Drag-and-drop for file organization (visual drop zone indicators)

**Editor Tabs:**
- Close button appears on hover
- Drag to reorder tabs
- Unsaved file indicator: dot before filename

**AI Chat:**
- Typing indicator: Three animated dots while AI processes
- Streaming response: Text appears progressively
- Action buttons: "Apply changes" with icon for code modifications

---

## Accessibility

- All interactive elements: minimum `h-8` tap target
- Keyboard shortcuts displayed in tooltips
- Focus indicators: 2px outline on all focusable elements
- Screen reader labels for icon-only buttons
- ARIA labels for panels and regions

---

## Images

No images required. This is a code editor interface focused on functional UI elements, code display, and technical interactions. All visual elements are UI components, icons (Heroicons), and syntax-highlighted code.