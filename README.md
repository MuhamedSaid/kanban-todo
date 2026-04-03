# 📋 Kanban Board — Task Management Dashboard

A **Kanban-style ToDo list application** built with modern frontend technologies. Features drag-and-drop between columns, real-time search, infinite scroll, and full CRUD operations.


![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui)
![React Query](https://img.shields.io/badge/React_Query-5-FF4154?logo=reactquery)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **4-Column Kanban Board** | TO DO → IN PROGRESS → IN REVIEW → DONE |
| **Drag & Drop** | Move tasks between columns with `@dnd-kit/react` |
| **CRUD Operations** | Create, edit, and delete tasks via modals |
| **Search** | Debounced search filters tasks by title or description |
| **Infinite Scroll** | Automatically loads more tasks as you scroll within a column |
| **Priority Badges** | Visual priority indicators (HIGH / MEDIUM / LOW) |
| **Responsive Layout** | Adapts from 4-column desktop to stacked mobile layout |
| **React Query Caching** | Smart data caching with automatic invalidation |
| **TypeScript** | Full type safety throughout the codebase |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Components** | [Material UI 7](https://mui.com/) |
| **State (Server)** | [TanStack React Query 5](https://tanstack.com/query) |
| **State (UI)** | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| **Drag & Drop** | [@dnd-kit/react](https://dndkit.com/) |
| **Mock API** | [json-server](https://github.com/typicode/json-server) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/muhamedsaid/kanban-todo.git
cd kanban-todo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Points the app to json-server for local development
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Start the mock API server

In one terminal:

```bash
npm run server
```

This starts json-server on `http://localhost:4000` with sample task data.

### 5. Start the development server

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main Kanban board page
│   ├── providers.tsx       # MUI + React Query providers
│   └── globals.css         # Global styles
├── components/
│   ├── board/
│   │   ├── KanbanBoard.tsx # Main board with DnD context
│   │   ├── KanbanColumn.tsx# Single droppable column
│   │   └── TaskCard.tsx    # Draggable task card
│   ├── dialogs/
│   │   └── TaskDialog.tsx  # Create/Edit task modal
│   ├── layout/
│   │   └── Header.tsx      # Top bar with search
│   └── common/
│       ├── PriorityBadge.tsx
│       ├── SearchBar.tsx
│       └── ConfirmDialog.tsx
├── hooks/
│   ├── useTasks.ts         # React Query hooks
│   └── useDebounce.ts      # Debounced value hook
├── store/
│   └── useKanbanStore.ts   # Zustand UI state
├── lib/
│   ├── api.ts              # API client & LocalStorage fallback
│   ├── queryClient.ts      # React Query configuration
│   └── theme.ts            # MUI theme customization
└── types/
    └── task.ts             # TypeScript interfaces
```

---

## 🏗 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **React Query** for server state | Caching, background refetching, and pagination built-in |
| **Zustand** for UI state | Lightweight store for modals and search — no boilerplate |
| **@dnd-kit/react** for DnD | Modern, maintained, React-first drag-and-drop toolkit |
| **LocalStorage API Fallback** | Enables a completely stable, stateful live deployment on Vercel's serverless edge. Bypasses `json-server` natively in production |
| **json-server** for local dev | Simple REST API with pagination, filtering, and search |

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run server` | Start json-server mock API on port 4000 |

---

## 🌐 Deployment

The app is successfully deployed to **Vercel**.

**Live Demo:** [https://kanban-todo-dun.vercel.app/](https://kanban-todo-dun.vercel.app/)

> **Technical Note on Deployment:** Because serverless environments (like Vercel) do not support persistent background processes, the live deployment dynamically bypasses `json-server` and falls back to a **high-fidelity `localStorage` database** in your browser. This means **full CRUD and Drag-and-Drop functionality work flawlessly** on the live demo without a dedicated backend, and your sessions are privately persisted!

---
