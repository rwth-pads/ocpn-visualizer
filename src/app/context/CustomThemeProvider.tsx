import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface CustomThemeProviderProps {
  children: ReactNode;
  darkMode: boolean;
}

const CustomThemeProvider = ({ children, darkMode }: CustomThemeProviderProps) => {
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#000000' : '#90caf9', // Light blue for dark mode, blue for light mode
      },
      secondary: {
        main: darkMode ? '#ffffff' : '#ffffff', // Pink for dark mode, red for light mode
      },
      background: {
        default: darkMode ? '#ffffff' : '#ffffff', // Dark background for dark mode, white for light mode
        paper: darkMode ? '#f5a800' : '#f5a800', // Slightly lighter background for paper elements
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000', // White text for dark mode, black text for light mode
        secondary: darkMode ? '#b0bec5' : '#757575', // Grey text for secondary elements
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
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;