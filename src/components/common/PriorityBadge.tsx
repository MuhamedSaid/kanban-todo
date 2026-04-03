'use client';

import { Chip } from '@mui/material';
import { Priority, PRIORITY_COLORS } from '@/types/task';

// ============================================================
// PriorityBadge — colored chip matching the UI design
// HIGH = red, MEDIUM = orange, LOW = gray
// ============================================================

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority];

  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 700,
        fontSize: '0.6rem',
        height: 20,
        borderRadius: '4px',
        letterSpacing: '0.05em',
      }}
    />
  );
}
