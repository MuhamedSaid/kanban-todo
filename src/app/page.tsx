import Header from '@/components/layout/Header';
import KanbanBoard from '@/components/board/KanbanBoard';

// ============================================================
// Home Page — the main Kanban board view
// This is a server component wrapper, children are client components
// ============================================================

export default function Home() {
  return (
    <main>
      <Header />
      <KanbanBoard />
    </main>
  );
}
