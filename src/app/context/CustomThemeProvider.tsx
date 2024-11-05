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
        light: darkMode ? '#000000' : '#0000000', // Light blue for dark mode, blue for light mode
      },
      secondary: {
        main: darkMode ? '#002e57' : '#002e57', // White for both modes
      },
      background: {
        default: darkMode ? '#ffffff' : '#ffffff', // Dark background for dark mode, white for light mode
        paper: darkMode ? '#ffffff' : '#ffffff', // Slightly lighter background for paper elements
      },
      text: {
        primary: darkMode ? '#ffffff' : '#ffffff', // White text for dark mode, black text for light mode
        secondary: darkMode ? '#000000' : '#002e57', // Grey text for secondary elements
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