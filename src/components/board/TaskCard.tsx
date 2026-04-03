'use client';

import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PriorityBadge from '@/components/common/PriorityBadge';
import { Task } from '@/types/task';
import { useKanbanStore } from '@/store/useKanbanStore';

// ============================================================
// TaskCard — a single task card inside a column
//
// Design per reference screenshots:
//   - White background on #EBF0F0 column
//   - Subtle border, minimal shadow
//   - Title, description (2 lines max), priority badge
//   - "..." menu on hover (top-right)
//   - Edit/delete actions on hover (bottom-right)
//   - Entire card is draggable (grab cursor)
// ============================================================

interface TaskCardProps {
  task: Task;
  /** Ref to attach for drag & drop — forwarded from parent */
  dragRef?: React.Ref<HTMLDivElement>;
  /** Whether this card is currently being dragged */
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  dragRef,
  isDragging = false,
}: TaskCardProps) {
  const openEditDialog = useKanbanStore((s) => s.openEditDialog);
  const openDeleteDialog = useKanbanStore((s) => s.openDeleteDialog);

  return (
    <Card
      ref={dragRef}
      sx={{
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        border: '1px solid #E9ECEF',
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
        '&:hover .task-actions': {
          opacity: 1,
        },
        '&:hover .more-btn': {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>


        {/* Title */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.4,
            mb: 0.5,
            pr: 3,
            color: 'text.primary',
          }}
        >
          {task.title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            mb: 1.5,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </Typography>

        {/* Bottom row: priority badge + actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <PriorityBadge priority={task.priority} />

          {/* Action buttons — visible on hover */}
          <Box
            className="task-actions"
            sx={{
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(task);
              }}
              sx={{ color: 'text.secondary', p: 0.25 }}
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog(task);
              }}
              sx={{ color: 'text.secondary', p: 0.25 }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
