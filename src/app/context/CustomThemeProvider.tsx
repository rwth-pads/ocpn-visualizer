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
        main: darkMode ? '#000000' : '#90caf9', // Light blue for dark mode, blue for light mode
      },
      secondary: {
        main: darkMode ? '#000000' : '#90caf9', // White for both modes
      },
      background: {
        default: darkMode ? '#ffffff' : '#ffffff', // Dark background for dark mode, white for light mode
        paper: darkMode ? '#ffffff' : '#ffffff', // Slightly lighter background for paper elements
      },
      text: {
        primary: darkMode ? '#ffffff' : '#90caf9', // White text for dark mode, black text for light mode
        secondary: darkMode ? '#000000' : '#90caf9', // Grey text for secondary elements
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#000000' : '#90caf9', // Light blue for dark mode, blue for light mode
          },
        },
      },
    },
  }), [darkMode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;