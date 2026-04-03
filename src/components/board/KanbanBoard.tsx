'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
import KanbanColumn from '@/components/board/KanbanColumn';
import TaskDialog from '@/components/dialogs/TaskDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useUpdateTask, useDeleteTask, useColumnTasks } from '@/hooks/useTasks';
import { useKanbanStore } from '@/store/useKanbanStore';
import { COLUMNS, ColumnId, Task } from '@/types/task';
import { useDebounce } from '@/hooks/useDebounce';

// ============================================================
// KanbanBoard — dnd-kit "Multiple Sortable Lists" pattern
//
// Architecture:
//   1. Board maintains local `items` state: { columnId: taskId[] }
//   2. `onDragOver` calls `move()` for real-time visual feedback
//   3. `onDragEnd` reads `source.group` from the event (not state)
//      to determine the new column and fires the API mutation
//   4. `useEffect` syncs server → local state but SKIPS during drag
//      to prevent the server refetch from overwriting drag order
// ============================================================

export default function KanbanBoard() {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const {
    isDeleteDialogOpen,
    deletingTask,
    closeDeleteDialog,
    searchTerm,
  } = useKanbanStore();

  const debouncedSearch = useDebounce(searchTerm, 300);

  // — Fetch server data per column —
  const todoQuery = useColumnTasks('todo', debouncedSearch);
  const inProgressQuery = useColumnTasks('in_progress', debouncedSearch);
  const inReviewQuery = useColumnTasks('in_review', debouncedSearch);
  const doneQuery = useColumnTasks('done', debouncedSearch);

  const queries: Record<ColumnId, typeof todoQuery> = {
    todo: todoQuery,
    in_progress: inProgressQuery,
    in_review: inReviewQuery,
    done: doneQuery,
  };

  // — Build task arrays from server data —
  const serverTasks: Record<ColumnId, Task[]> = useMemo(() => ({
    todo: todoQuery.data?.pages.flatMap((p) => p.tasks) ?? [],
    in_progress: inProgressQuery.data?.pages.flatMap((p) => p.tasks) ?? [],
    in_review: inReviewQuery.data?.pages.flatMap((p) => p.tasks) ?? [],
    done: doneQuery.data?.pages.flatMap((p) => p.tasks) ?? [],
  }), [todoQuery.data, inProgressQuery.data, inReviewQuery.data, doneQuery.data]);

  // Task lookup map: id -> Task
  const taskMap = useMemo(() => {
    const map = new Map<number, Task>();
    Object.values(serverTasks).forEach((tasks) =>
      tasks.forEach((t) => map.set(t.id, t))
    );
    return map;
  }, [serverTasks]);

  // — Local items state: { columnId: taskId[] }
  // This is what dnd-kit's `move()` helper operates on.
  const [items, setItems] = useState<Record<string, number[]>>({
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  });

  // Flag to prevent useEffect sync from overwriting drag order
  const isDraggingRef = useRef(false);

  // Sync local items from server data — SKIP during active drag
  useEffect(() => {
    if (isDraggingRef.current) return;
    
    setItems((prev) => {
      const processColumn = (colId: ColumnId) => {
        // IDs coming directly from the server
        const serverIds = serverTasks[colId].map((t) => t.id);
        const serverSet = new Set(serverIds);
        
        // Retain the existing drag-and-drop visual order for IDs that still belong to this column
        const kept = prev[colId].filter((id) => serverSet.has(id));
        const keptSet = new Set(kept);
        
        // Append any brand new tasks coming from the server
        const added = serverIds.filter((id) => !keptSet.has(id));
        
        return [...kept, ...added];
      };

      return {
        todo: processColumn('todo'),
        in_progress: processColumn('in_progress'),
        in_review: processColumn('in_review'),
        done: processColumn('done'),
      };
    });
  }, [serverTasks]);

  // Snapshot for cancel support (ref-only, no state)
  const previousItems = useRef(items);

  // Track original column for API call (ref-only, no state)
  const originalColumnRef = useRef<ColumnId | null>(null);

  // — Build Task[] arrays from the local items order —
  const orderedTasks: Record<ColumnId, Task[]> = useMemo(() => {
    const result = {} as Record<ColumnId, Task[]>;
    for (const colId of Object.keys(items) as ColumnId[]) {
      result[colId] = items[colId]
        .map((id) => taskMap.get(id))
        .filter((t): t is Task => t !== undefined);
    }
    return result;
  }, [items, taskMap]);

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (deletingTask) {
      deleteMutation.mutate(deletingTask, {
        onSuccess: () => closeDeleteDialog(),
      });
    }
  };

  return (
    <>
      <DragDropProvider
        onDragStart={(event) => {
          // Only use refs here — no setState calls
          // This avoids the flushSync error from dnd-kit internals
          isDraggingRef.current = true;
          previousItems.current = structuredClone(items);

          const { source } = event.operation;
          if (source?.type === 'item' && isSortable(source)) {
            // Store the original column from source.group
            originalColumnRef.current = (source.group as ColumnId) ?? null;
          } else {
            originalColumnRef.current = null;
          }
        }}
        onDragOver={(event) => {
          const { source } = event.operation;
          // Only move items, not columns
          if (source?.type === 'column') return;
          // Defer the state update to a microtask to sidestep React 19 flushSync error
          // caused by dnd-kit's internal signals firing during an active render phase.
          queueMicrotask(() => {
            setItems((currentItems) => move(currentItems, event));
          });
        }}
        onDragEnd={(event) => {
          // DO NOT set isDraggingRef = false here!
          // The sync must stay blocked until the mutation + refetch cycle
          // completes, otherwise useEffect overwrites the drag order.

          if (event.canceled) {
            isDraggingRef.current = false;
            setItems(previousItems.current);
            originalColumnRef.current = null;
            return;
          }

          const { source } = event.operation;

          // Handle item drag — fire API mutation
          if (source?.type === 'item' && isSortable(source)) {
            const newColumn = source.group as ColumnId | undefined;
            const oldColumn = originalColumnRef.current;

            if (newColumn && oldColumn && newColumn !== oldColumn) {
              // Column changed — fire mutation, keep isDraggingRef true
              // until the mutation + refetch cycle settles
              const taskId = source.id as number;
              updateMutation.mutate(
                {
                  id: taskId,
                  updates: { column: newColumn },
                  previousColumn: oldColumn,
                },
                {
                  onSettled: () => {
                    // Re-enable sync AFTER mutation + refetch cycle
                    setTimeout(() => {
                      isDraggingRef.current = false;
                    }, 300);
                  },
                }
              );
            } else {
              // Same column reorder — no mutation needed, move() already
              // updated local state. Re-enable sync after a tick.
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 100);
            }
          } else {
            // Column drag or unknown type — re-enable sync
            isDraggingRef.current = false;
          }

          originalColumnRef.current = null;
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
            px: { xs: 2, md: 4 },
            py: 3,
            overflowX: 'auto',
            minHeight: 'calc(100vh - 72px)',
            backgroundColor: '#F8F9FA',
          }}
        >
          {COLUMNS.map((col, index) => (
            <KanbanColumn
              key={col.id}
              config={col}
              index={index}
              tasks={orderedTasks[col.id]}
              totalCount={queries[col.id].data?.pages[0]?.totalCount ?? orderedTasks[col.id].length}
              isLoading={queries[col.id].isLoading}
              hasNextPage={!!queries[col.id].hasNextPage}
              isFetchingNextPage={queries[col.id].isFetchingNextPage}
              fetchNextPage={queries[col.id].fetchNextPage}
            />
          ))}
        </Box>
      </DragDropProvider>

      {/* Modals */}
      <TaskDialog />
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
