import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Check if user has a preferred theme when the component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Toggle theme function
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  // Create Material UI theme based on darkMode state
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode 
        ? {
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
              primary: '#FFFFFF',
              secondary: '#E2E8F0',
            },
          }
        : {
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
              primary: '#1A202C',
              secondary: '#2D3748',
            },
          }),
    }
  }), [darkMode]);

  // Context value
  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContext; 