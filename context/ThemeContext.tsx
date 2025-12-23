'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void; // Cycle through modes or just toggle light/dark? The requirement says "toggle button(light, dark, system - default)". A cycle might be good or a selector.
  // Actually, a simple toggle might be ambiguous if there are 3 states. 
  // I'll provide setMode strictly.
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage directly to avoid cascading renders
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check if we're in the browser (not SSR)
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      return savedMode || 'system';
    }
    return 'system';
  });
  
  // Checking system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', nextMode);
      return nextMode;
    });
  };

  const activeTheme = useMemo(() => {
    let effectiveMode: 'light' | 'dark' = 'light';
    
    if (mode === 'system') {
      effectiveMode = prefersDarkMode ? 'dark' : 'light';
    } else {
      effectiveMode = mode;
    }

    return createTheme({
      palette: {
        mode: effectiveMode,
        ...(effectiveMode === 'light'
          ? {
              // Light mode palette
              primary: {
                main: '#ec4899', // Pink-500 from DiscoveryScreen
              },
              background: {
                default: '#f3f4f6', // gray-100ish
                paper: '#ffffff',
              },
              text: {
                primary: '#111827', // gray-900
                secondary: '#6b7280', // gray-500
              },
            }
          : {
              // Dark mode palette
              primary: {
                main: '#ec4899',
              },
              background: {
                default: '#1f2937', // gray-800
                paper: '#111827', // gray-900
              },
              text: {
                primary: '#f9fafb', // gray-50
                secondary: '#9ca3af', // gray-400
              },
            }),
      },
      typography: {
        fontFamily: '"Geist Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none', // Remove default elevation overlay in dark mode for cleaner look
            },
          },
        },
      },
    });
  }, [mode, prefersDarkMode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode: handleSetMode, toggleColorMode }}>
      <MuiThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
