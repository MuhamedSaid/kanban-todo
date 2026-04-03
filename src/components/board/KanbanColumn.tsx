'use client';

import { useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/react/sortable';
import TaskCard from '@/components/board/TaskCard';
import { useKanbanStore } from '@/store/useKanbanStore';
import { ColumnConfig, Task } from '@/types/task';

// ============================================================
// KanbanColumn — a single sortable column
//
// Per dnd-kit docs, columns use `useSortable` with:
//   type: 'column'
//   accept: ['item', 'column']
//   collisionPriority: 1 (lower than items)
//
// Design:
//   - Column background: #EBF0F0
//   - DragIndicatorIcon on top-left as column drag handle
//   - "+ Add task" button appears on column hover, under last card
//   - Empty columns have min-height for drop targets
// ============================================================

interface KanbanColumnProps {
  config: ColumnConfig;
  index: number;
  tasks: Task[];
  totalCount: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export default function KanbanColumn({
  config,
  index,
  tasks,
  totalCount,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: KanbanColumnProps) {
  const openCreateDialog = useKanbanStore((s) => s.openCreateDialog);

  // Column as a sortable — per dnd-kit docs for kanban boards
  // handleRef restricts dragging to only the drag handle icon
  const { ref: columnRef, handleRef } = useSortable({
    id: config.id,
    index,
    type: 'column',
    accept: ['item', 'column'],
    collisionPriority: 1,
  });

  // Intersection Observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Box
      ref={columnRef}
      sx={{
        backgroundColor: '#EBF0F0',
        borderRadius: 2,
        p: 2,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
        // Show "Add task" button on column hover
        '&:hover .add-task-btn': {
          opacity: 1,
        },
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        {/* Drag handle for column reordering — only this icon triggers column drag */}
        <Box
          ref={handleRef}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
        >
          <DragIndicatorIcon
            sx={{
              fontSize: 18,
              color: 'text.disabled',
              mr: 0.5,
            }}
          />
        </Box>

        {/* Colored dot */}
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: config.dotColor,
            flexShrink: 0,
            mr: 1,
          }}
        />

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'text.secondary',
            letterSpacing: '0.08em',
          }}
        >
          {config.label}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 600,
            fontSize: '0.75rem',
            ml: 1,
          }}
        >
          {totalCount}
        </Typography>

      </Box>

      {/* Task List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && tasks.length === 0 && (
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'text.disabled',
              py: 4,
              fontSize: '0.8rem',
            }}
          >
            No tasks
          </Typography>
        )}

        {tasks.map((task, taskIndex) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            index={taskIndex}
            column={config.id}
          />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {isFetchingNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={18} />
          </Box>
        )}

        {/* + Add task — inside the list so it appears directly under cards */}
        <Button
          className="add-task-btn"
          startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => openCreateDialog(config.id)}
          sx={{
            color: 'text.secondary',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 500,
            py: 0.75,
            opacity: 0,
            transition: 'opacity 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              backgroundColor: '#FFFFFF',
              borderColor: '#ADB5BD',
            },
          }}
          fullWidth
        >
          Add task
        </Button>
      </Box>
    </Box>
  );
}

// ============================================================
// SortableTaskCard — wraps TaskCard with dnd-kit sortable
//
// Per dnd-kit docs:
//   type: 'item'
//   accept: 'item'
//   group: column  (groups items by column for cross-list moves)
// ============================================================

function SortableTaskCard({
  task,
  index,
  column,
}: {
  task: Task;
  index: number;
  column: string;
}) {
  const { ref, isDragSource } = useSortable({
    id: task.id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
  });

  return (
    <TaskCard
      task={task}
      dragRef={ref}
      isDragging={isDragSource}
    />
  );
}
