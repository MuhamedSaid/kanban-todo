import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchColumnTasks,
  fetchAllTasksCount,
  createTask,
  updateTask,
  deleteTask,
  ColumnTasksResponse,
} from '@/lib/api';
import { ColumnId, CreateTaskPayload, Task, COLUMNS } from '@/types/task';

// ============================================================
// React Query Hooks — server state management
//
// Architecture:
//   - useColumnTasks(): infinite query per column (pagination + search)
//   - useTaskCount(): total task count for header
//   - useCreateTask(): create mutation
//   - useUpdateTask(): update mutation (handles column transfers for DnD)
//   - useDeleteTask(): delete mutation
// ============================================================

/** Query key factory for consistent cache keys */
const taskKeys = {
  all: ['tasks'] as const,
  column: (column: ColumnId, search: string) =>
    ['tasks', 'column', column, search] as const,
  count: ['tasks', 'count'] as const,
};

/**
 * Fetch tasks for a single column with infinite scroll support.
 * Each "page" loads PAGE_SIZE tasks; fetching stops when hasMore is false.
 */
export function useColumnTasks(column: ColumnId, search: string = '') {
  return useInfiniteQuery<ColumnTasksResponse>({
    queryKey: taskKeys.column(column, search),
    queryFn: ({ pageParam }) =>
      fetchColumnTasks(column, pageParam as number, search),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      // Return the next page number (1-indexed)
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

/**
 * Fetch total task count (displayed in the header).
 */
export function useTaskCount() {
  return useQuery({
    queryKey: taskKeys.count,
    queryFn: fetchAllTasksCount,
  });
}

/**
 * Create a new task. Invalidates the target column + count caches.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (_data, variables) => {
      // Invalidate the column the task was added to
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'column', variables.column],
      });
      // Update total count
      queryClient.invalidateQueries({ queryKey: taskKeys.count });
    },
  });
}

/**
 * Update an existing task. Handles column transfers (DnD) by
 * invalidating both the source and target column caches.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Omit<Task, 'id'>>;
      previousColumn?: ColumnId;
    }) => updateTask(id, updates),
    onSuccess: () => {
      // Invalidate ALL column queries to ensure consistency
      // This ensures both source and target column counters are correct
      COLUMNS.forEach((col) => {
        queryClient.invalidateQueries({
          queryKey: ['tasks', 'column', col.id],
        });
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.count });
    },
  });
}

/**
 * Delete a task. Invalidates the column cache + count.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onSuccess: (_data, task) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'column', task.column],
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.count });
    },
  });
}
