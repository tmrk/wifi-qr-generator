import { createTheme } from '@mui/material/styles';

const palettes = {
  light: {
    primary: { main: '#1b5fd1', dark: '#1450b3', contrastText: '#ffffff' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
    text: { primary: '#14181f', secondary: '#4a5463' },
    divider: 'rgba(20, 24, 31, 0.12)',
  },
  dark: {
    // In dark mode the hover colour is lighter, so the button never looks dimmed.
    primary: { main: '#8ab4ff', dark: '#b5d0ff', contrastText: '#0b1220' },
    background: { default: '#0e1116', paper: '#171b22' },
    text: { primary: '#eef1f6', secondary: '#a9b3c2' },
    divider: 'rgba(238, 241, 246, 0.14)',
  },
};

// Colour of the app bar, used for the browser theme-color meta tags.
export const barColor = (mode) => palettes[mode].background.paper;

export const createAppTheme = (mode) => {
  const p = palettes[mode];
  return createTheme({
    palette: { mode, ...p },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h2: { fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            WebkitTextSizeAdjust: '100%',
            overscrollBehavior: 'none',
            WebkitTapHighlightColor: 'transparent',
          },
          body: { WebkitTouchCallout: 'none', touchAction: 'manipulation' },
          'button, [role="button"], [role="tab"], [role="menuitem"], label, header': {
            userSelect: 'none',
            WebkitUserSelect: 'none',
          },
          ':focus-visible': {
            outline: `3px solid ${p.primary.main}`,
            outlineOffset: 2,
          },
          '.rise': { animation: 'rise 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both' },
          '@keyframes rise': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'none' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 48, borderRadius: 14, paddingInline: 20 },
          sizeLarge: { minHeight: 56, fontSize: '1.0625rem' },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          // Solid tracks so the control keeps at least 3:1 against the surface.
          switchBase: {
            color: mode === 'light' ? '#ffffff' : '#0e1116',
            '&.Mui-checked': { color: mode === 'light' ? '#ffffff' : '#0b1220' },
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: p.primary.main, opacity: 1 },
          },
          track: { backgroundColor: mode === 'light' ? '#6f7a8b' : '#7c8797', opacity: 1 },
        },
      },
      MuiIconButton: { styleOverrides: { root: { width: 44, height: 44 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: p.text.primary,
          },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 48 } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    },
  });
};
