import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Task, ColumnId } from '@/types/task';

// ============================================================
// Zustand Store — UI-only state
//
// Following the Zustand skill patterns:
//   - subscribeWithSelector middleware for external subscriptions
//   - Separated State/Actions interfaces for clarity
//   - Individual selectors in consuming components
//
// Server data (tasks) lives in React Query.
// This store manages: search term, modal state, active task.
// ============================================================

/** UI state shape */
interface KanbanState {
  searchTerm: string;
  isTaskDialogOpen: boolean;
  editingTask: Task | null;
  targetColumn: ColumnId;
  isDeleteDialogOpen: boolean;
  deletingTask: Task | null;
}

/** UI actions */
interface KanbanActions {
  setSearchTerm: (term: string) => void;
  openCreateDialog: (column: ColumnId) => void;
  openEditDialog: (task: Task) => void;
  closeTaskDialog: () => void;
  openDeleteDialog: (task: Task) => void;
  closeDeleteDialog: () => void;
}

export type KanbanStore = KanbanState & KanbanActions;

export const useKanbanStore = create<KanbanStore>()(
  subscribeWithSelector((set) => ({
    // ---- State ----
    searchTerm: '',
    isTaskDialogOpen: false,
    editingTask: null,
    targetColumn: 'todo',
    isDeleteDialogOpen: false,
    deletingTask: null,

    // ---- Actions ----
    setSearchTerm: (term) => set({ searchTerm: term }),

    openCreateDialog: (column) =>
      set({
        isTaskDialogOpen: true,
        editingTask: null,
        targetColumn: column,
      }),

    openEditDialog: (task) =>
      set({
        isTaskDialogOpen: true,
        editingTask: task,
        targetColumn: task.column,
      }),

    closeTaskDialog: () =>
      set({
        isTaskDialogOpen: false,
        editingTask: null,
      }),

    openDeleteDialog: (task) =>
      set({
        isDeleteDialogOpen: true,
        deletingTask: task,
      }),

    closeDeleteDialog: () =>
      set({
        isDeleteDialogOpen: false,
        deletingTask: null,
      }),
  }))
);
