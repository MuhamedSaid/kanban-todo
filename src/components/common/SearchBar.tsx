'use client';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useKanbanStore } from '@/store/useKanbanStore';

// ============================================================
// SearchBar — debounced search input in the header
// Updates Zustand store; the debounced value drives React Query
// ============================================================

export default function SearchBar() {
  const searchTerm = useKanbanStore((s) => s.searchTerm);
  const setSearchTerm = useKanbanStore((s) => s.setSearchTerm);

  return (
    <TextField
      placeholder="Search tasks..."
      size="small"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        width: { xs: '100%', sm: 260 },
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
          fontSize: '0.875rem',
        },
      }}
    />
  );
}
