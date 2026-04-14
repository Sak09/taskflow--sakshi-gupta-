import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5', contrastText: '#fff' },
    secondary: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    info: { main: '#3B82F6' },
    neutral: { main: '#64748B', light: '#94A3B8', dark: '#475569', contrastText: '#fff' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    overline: { fontWeight: 600, letterSpacing: '0.08em' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
    '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.02)',
    ...Array(19).fill('none'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingLeft: 20, paddingRight: 20 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.45)', transform: 'translateY(-1px)' },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)', transition: 'all 0.2s ease' },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: '0.72rem' } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
          color: '#0F172A',
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16, border: '1px solid #E2E8F0' } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 4, height: 6 } },
    },
  },
});

export const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  todo:        { bg: '#F1F5F9', color: '#64748B', label: 'To Do' },
  in_progress: { bg: '#EFF6FF', color: '#3B82F6', label: 'In Progress' },
  done:        { bg: '#F0FDF4', color: '#10B981', label: 'Done' },
};

export const priorityColors: Record<string, { bg: string; color: string; label: string }> = {
  low:    { bg: '#F0FDF4', color: '#10B981', label: 'Low' },
  medium: { bg: '#FFFBEB', color: '#F59E0B', label: 'Medium' },
  high:   { bg: '#FEF2F2', color: '#EF4444', label: 'High' },
};
