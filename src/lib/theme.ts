import { createTheme } from '@mui/material/styles';

// Material 3 color tokens
const lightPalette = {
  primary: {
    main: '#6750A4',
    light: '#EADDFF',
    dark: '#21005D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#625B71',
    light: '#E8DEF8',
    dark: '#1D192B',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFBFE',
    paper: '#FFFBFE',
  },
  surface: {
    main: '#FFFBFE',
    variant: '#F4EFF4',
  },
};

const darkPalette = {
  primary: {
    main: '#D0BCFF',
    light: '#21005D',
    dark: '#EADDFF',
    contrastText: '#381E72',
  },
  secondary: {
    main: '#CCC2DC',
    light: '#1D192B',
    dark: '#E8DEF8',
    contrastText: '#332D41',
  },
  background: {
    default: '#10081A',
    paper: '#10081A',
  },
  surface: {
    main: '#10081A',
    variant: '#49454F',
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...lightPalette,
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          elevation: 1,
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...darkPalette,
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          elevation: 1,
          borderRadius: 12,
          backgroundColor: '#1C1B1F',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});
