'use client';

import { Box, Typography } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SearchBar from '@/components/common/SearchBar';
import { useTaskCount } from '@/hooks/useTasks';

// ============================================================
// Header — top bar with logo, title, task count, and search
// Matches the UI design's "KANBAN BOARD / 10 tasks" header
// ============================================================

export default function Header() {
  const { data: totalCount } = useTaskCount();

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Left side: icon + title + count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <GridViewRoundedIcon
          sx={{
            fontSize: 28,
            color: 'primary.main',
            backgroundColor: '#EDF2FF',
            borderRadius: 1,
            p: 0.5,
          }}
        />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              lineHeight: 1.2,
            }}
          >
            KANBAN BOARD
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
          >
            {totalCount !== undefined ? `${totalCount} tasks` : 'Loading...'}
          </Typography>
        </Box>
      </Box>

      {/* Right side: search bar */}
      <SearchBar />
    </Box>
  );
}
