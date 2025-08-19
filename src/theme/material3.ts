import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';
import '@fontsource-variable/inter';

// Material 3 Design Tokens
const tokens = {
  // Spacing scale (8px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Animation durations
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  
  // Elevation (Material 3 style)
  elevation: {
    0: 'none',
    1: '0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    2: '0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
    3: '0 4px 8px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
    4: '0 6px 12px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)',
    5: '0 8px 16px rgba(0,0,0,0.14), 0 16px 32px rgba(0,0,0,0.10)',
  },
};

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors (Material 3)
          primary: {
            main: '#6750A4',
            light: '#7965B2',
            dark: '#523E7E',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#386A20',
            light: '#4A8A2C',
            dark: '#2A5018',
            contrastText: '#FFFFFF',
          },
          error: {
            main: '#B3261E',
            light: '#DC362E',
            dark: '#8C1D18',
            contrastText: '#FFFFFF',
          },
          warning: {
            main: '#F9AB00',
            light: '#FFBD00',
            dark: '#C58700',
            contrastText: '#000000',
          },
          info: {
            main: '#0B57D0',
            light: '#4285F4',
            dark: '#0842A0',
            contrastText: '#FFFFFF',
          },
          success: {
            main: '#0F9D58',
            light: '#34A853',
            dark: '#0B7C43',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#FBF8FD',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#1C1B1F',
            secondary: '#49454F',
            disabled: '#79747E',
          },
          divider: alpha('#1C1B1F', 0.08),
        }
      : {
          // Dark mode colors (Material 3)
          primary: {
            main: '#D0BCFF',
            light: '#E8DDFF',
            dark: '#A08CDB',
            contrastText: '#381E72',
          },
          secondary: {
            main: '#9FD67E',
            light: '#B8E6A3',
            dark: '#7EAA5E',
            contrastText: '#1B3700',
          },
          error: {
            main: '#F2B8B5',
            light: '#FFCCC8',
            dark: '#DC8B87',
            contrastText: '#601410',
          },
          warning: {
            main: '#FFD97D',
            light: '#FFE4A3',
            dark: '#D4B052',
            contrastText: '#3F2E00',
          },
          info: {
            main: '#A8C7FA',
            light: '#C2DFFF',
            dark: '#7CACF8',
            contrastText: '#003C71',
          },
          success: {
            main: '#81C995',
            light: '#A8E6A3',
            dark: '#5BA670',
            contrastText: '#00390A',
          },
          background: {
            default: '#0B0B0C',
            paper: '#1C1B1F',
          },
          text: {
            primary: '#E6E1E5',
            secondary: '#CAC4D0',
            disabled: '#79747E',
          },
          divider: alpha('#E6E1E5', 0.08),
        }),
  },
  
  typography: {
    fontFamily: '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    h1: {
      fontSize: 28,
      lineHeight: '36px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    h2: {
      fontSize: 22,
      lineHeight: '30px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    h3: {
      fontSize: 18,
      lineHeight: '26px',
      fontWeight: 600,
      letterSpacing: 0,
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    h4: {
      fontSize: 16,
      lineHeight: '24px',
      fontWeight: 600,
      letterSpacing: 0,
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    h5: {
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 600,
      letterSpacing: 0,
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    h6: {
      fontSize: 12,
      lineHeight: '18px',
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    body1: {
      fontSize: 16,
      lineHeight: '24px',
      letterSpacing: 0,
      fontFeatureSettings: '"ss01", "ss02"',
    },
    body2: {
      fontSize: 14,
      lineHeight: '20px',
      letterSpacing: 0,
      fontFeatureSettings: '"ss01", "ss02"',
    },
    button: {
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.01em',
      textTransform: 'none',
      fontFeatureSettings: '"ss01", "ss02"',
    },
    caption: {
      fontSize: 12,
      lineHeight: '18px',
      letterSpacing: '0.01em',
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
    overline: {
      fontSize: 11,
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontFeatureSettings: '"ss01", "ss02", "tnum"',
    },
  },
  
  shape: {
    borderRadius: tokens.radius.md,
  },
  
  shadows: [
    'none',
    tokens.elevation[1],
    tokens.elevation[1],
    tokens.elevation[2],
    tokens.elevation[2],
    tokens.elevation[2],
    tokens.elevation[3],
    tokens.elevation[3],
    tokens.elevation[3],
    tokens.elevation[3],
    tokens.elevation[4],
    tokens.elevation[4],
    tokens.elevation[4],
    tokens.elevation[4],
    tokens.elevation[4],
    tokens.elevation[4],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
    tokens.elevation[5],
  ],
  
  transitions: {
    duration: tokens.duration,
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'light' ? '#CAC4D0 #F4F4F4' : '#49454F #1C1B1F',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 12,
            height: 12,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#CAC4D0' : '#49454F',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: mode === 'light' ? '#F4F4F4' : '#1C1B1F',
          },
        },
        '*:focus-visible': {
          outline: `3px solid ${mode === 'light' ? '#6750A4' : '#D0BCFF'}`,
          outlineOffset: 2,
          borderRadius: tokens.radius.xs,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.full,
          padding: '10px 24px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: tokens.elevation[2],
          },
        },
        contained: {
          '&:hover': {
            boxShadow: tokens.elevation[3],
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: alpha(mode === 'light' ? '#6750A4' : '#D0BCFF', 0.08),
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.lg,
          boxShadow: tokens.elevation[1],
          border: 'none',
          backgroundImage: 'none',
          padding: tokens.spacing.md,
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.full,
          fontWeight: 500,
          height: 28,
        },
        sizeSmall: {
          height: 24,
          fontSize: 11,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.md,
            '& fieldset': {
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: tokens.radius.full,
          backgroundColor: alpha(mode === 'light' ? '#6750A4' : '#D0BCFF', 0.12),
        },
        bar: {
          borderRadius: tokens.radius.full,
        },
      },
    },
    
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: tokens.radius.sm,
          fontSize: 12,
          padding: '6px 12px',
          boxShadow: tokens.elevation[2],
        },
      },
    },
    
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: `${tokens.radius.md}px !important`,
          boxShadow: 'none',
          border: `1px solid ${mode === 'light' ? alpha('#1C1B1F', 0.08) : alpha('#E6E1E5', 0.08)}`,
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.full,
          '&:hover': {
            backgroundColor: alpha(mode === 'light' ? '#6750A4' : '#D0BCFF', 0.08),
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(getDesignTokens(mode));
};

export { tokens };

