import { createTheme, PaletteMode } from '@mui/material';

// Professional color palette
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2563eb' : '#60a5fa', // Brighter blue for dark mode
      light: '#93c5fd',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#7c3aed' : '#a78bfa', // Brighter purple for dark mode
      light: '#c4b5fd',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald 500
      light: '#34d399', // Emerald 400
      dark: '#059669', // Emerald 600
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#04070a', // Deep black background
      paper: mode === 'light' ? '#ffffff' : '#0f172a',   // Slate deep surface
    },
    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f1f5f9', // Crisp light gray/white
      secondary: mode === 'light' ? '#64748b' : '#94a3b8', // Muted slate gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 4, // Classic architectural sharpness
  },
  shadows: (mode === 'light'
    ? [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      ...Array(20).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
    ]
    : [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      '0 10px 20px -3px rgba(0, 0, 0, 0.6), 0 4px 10px -2px rgba(0, 0, 0, 0.4)',
      '0 25px 30px -5px rgba(0, 0, 0, 0.7), 0 15px 15px -5px rgba(0, 0, 0, 0.5)',
      ...Array(20).fill('0 30px 60px -12px rgba(0, 0, 0, 0.8)'),
    ]) as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f8fafc',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: mode === 'dark' ? '#0f172a' : '#f8fafc',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#334155' : '#cbd5e1',
            borderRadius: '10px',
            border: `2px solid ${mode === 'dark' ? '#0f172a' : '#f8fafc'}`,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            background: mode === 'dark' ? '#475569' : '#94a3b8',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              : '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          color: '#ffffff',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
          borderRadius: 4,
          border: mode === 'light' ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: mode === 'light' ? '#3b82f6' : '#9ca3af',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
          border: mode === 'light' ? '1px solid #e5e7eb' : '1px solid #374151',
        },
        elevation1: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            transition: 'all 0.2s ease',
            backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.3)',
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#2563eb' : '#60a5fa',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#2563eb' : '#60a5fa',
              boxShadow: mode === 'light'
                ? '0 0 0 4px rgba(37, 99, 235, 0.1)'
                : '0 0 0 4px rgba(96, 165, 250, 0.1)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
          backgroundImage: 'none',
          border: mode === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: mode === 'light'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            : '0 50px 100px -20px rgba(0, 0, 0, 0.8)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          border: mode === 'light' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: mode === 'light'
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'light'
            ? '1px solid rgba(0, 0, 0, 0.05)'
            : '1px solid rgba(255, 255, 255, 0.05)',
          color: mode === 'light' ? '#0f172a' : '#f1f5f9',
        },
      },
    },
  },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode) as any);
