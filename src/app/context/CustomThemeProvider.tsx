import React, { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface CustomThemeProviderProps {
  children: ReactNode;
  darkMode: boolean;
}

const CustomThemeProvider = ({ children, darkMode }: CustomThemeProviderProps) => {
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#000000' : '#002e57',
        light: darkMode ? '#000000' : '#0000000',
      },
      secondary: {
        main: darkMode ? '#000000' : '#002e57',
      },
      background: {
        default: darkMode ? '#ffffff' : '#ffffff',
        paper: darkMode ? '#ffffff' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#ffffff',
        secondary: darkMode ? '#000000' : '#002e57',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#000000' : '#002e57', // Light blue for dark mode, blue for light mode
            color: darkMode ? '#ffffff' : '#ffffff', // White text for dark mode, black text for light mode
          },
        },
      },
    },
  }), [darkMode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;