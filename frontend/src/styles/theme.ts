import { createTheme, Theme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: {
              main: '#4A3AFF',
              light: '#6C5CE7',
              dark: '#3621e1',
            },
            secondary: {
              main: '#FF5E84',
              light: '#FF7A9F',
              dark: '#DD3D62',
            },
            background: {
              default: '#F7F9FC',
              paper: '#FFFFFF',
              card: '#FFFFFF',
            },
            text: {
              primary: '#2D3748',
              secondary: '#4A5568',
            },
          }
        : {
            // Dark mode
            primary: {
              main: '#6C5CE7',
              light: '#8A7EFF',
              dark: '#4A3AFF',
            },
            secondary: {
              main: '#FF5E84',
              light: '#FF7A9F',
              dark: '#DD3D62',
            },
            background: {
              default: '#1A202C',
              paper: '#2D3748',
              card: '#2D3748',
            },
            text: {
              primary: '#F7FAFC',
              secondary: '#E2E8F0',
            },
          }),
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3rem',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 8px 20px rgba(106, 92, 231, 0.25)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(45deg, #4A3AFF 0%, #6C5CE7 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0px 10px 25px rgba(0, 0, 0, 0.05)' 
              : '0px 10px 25px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: mode === 'light'
                ? '0px 20px 35px rgba(0, 0, 0, 0.1)'
                : '0px 20px 35px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });
};

export default getTheme; 