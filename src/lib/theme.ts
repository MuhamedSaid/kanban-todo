'use client';

import { createTheme } from '@mui/material/styles';

// ============================================================
// MUI Theme — matches the clean, light Kanban board UI design
// ============================================================
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4C6EF5',
      light: '#748FFC',
      dark: '#3B5BDB',
    },
    secondary: {
      main: '#F59F00',
    },
    success: {
      main: '#40C057',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#868E96',
    },
    divider: '#E9ECEF',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    body2: {
      color: '#868E96',
      fontSize: '0.8125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid #F1F3F5',
          transition: 'box-shadow 0.2s ease, transform 0.15s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.625rem',
          height: 22,
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
