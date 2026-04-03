// ============================================================
// Task Types — Core data model for the Kanban board
// ============================================================

/** The four Kanban columns */
export type ColumnId = 'todo' | 'in_progress' | 'in_review' | 'done';

/** Task priority levels */
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

/** Core task entity matching the json-server schema */
export interface Task {
  id: number;
  title: string;
  description: string;
  column: ColumnId;
  priority: Priority;
}

/** Payload for creating a new task (no id — server assigns it) */
export type CreateTaskPayload = Omit<Task, 'id'>;

/** Payload for updating an existing task (partial fields + id) */
export type UpdateTaskPayload = Partial<Omit<Task, 'id'>> & { id: number };

/** Column display configuration */
export interface ColumnConfig {
  id: ColumnId;
  label: string;
  dotColor: string;
}

/** All 4 columns with their display settings */
export const COLUMNS: ColumnConfig[] = [
  { id: 'todo', label: 'TO DO', dotColor: '#4C6EF5' },
  { id: 'in_progress', label: 'IN PROGRESS', dotColor: '#F59F00' },
  { id: 'in_review', label: 'IN REVIEW', dotColor: '#F59F00' },
  { id: 'done', label: 'DONE', dotColor: '#40C057' },
];

/** Map column IDs to their labels (for dropdowns, etc.) */
export const COLUMN_LABELS: Record<ColumnId, string> = {
  todo: 'TO DO',
  in_progress: 'IN PROGRESS',
  in_review: 'IN REVIEW',
  done: 'DONE',
};

/** Priority badge color mapping */
export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  HIGH: { bg: '#FFE0E0', text: '#E53935' },
  MEDIUM: { bg: '#FFF3E0', text: '#FB8C00' },
  LOW: { bg: '#F5F5F5', text: '#9E9E9E' },
};

/** Number of tasks to load per page (for infinite scroll) */
export const PAGE_SIZE = 5;
