"use client";

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useMediaQuery, Collapse, Tabs, Tab, useTheme } from '@mui/material';
import CustomThemeProvider from './context/CustomThemeProvider';

const Home = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const isSmallScreen = useMediaQuery('(max-width: 900px)'); // Adjust the threshold as needed
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    const [menuOpen, setMenuOpen] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    useEffect(() => {
        if (isSmallScreen) {
            setMenuOpen(false);
        }
    }, [isSmallScreen]);

    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleMenuClick = () => {
        setMenuOpen(!menuOpen);
    };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <CustomThemeProvider darkMode={darkMode}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            OCPN Visualizer
                        </Typography>
                        <Button color="inherit">Import</Button>
                        <Button color="inherit">Export</Button>
                        <IconButton edge="end" color="inherit" aria-label="toggle dark mode" onClick={handleToggleDarkMode}>
                            <Brightness4Icon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Collapse in={menuOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="Visualization" />
                            <Tab label="Styling Options" />
                            <Tab label="OCPN Options" />
                            <Tab label="Editor" />
                        </Tabs>
                    </Box>
                </Collapse>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'grid',
                        gridTemplateColumns: tabValue === 0 || isSmallScreen ? '1fr' : '2fr 3fr',
                        gap: 2,
                        p: 2,
                    }}
                >
                    {tabValue !== 0 &&(
                        // Always show the content of the configuration tabs no matter the screen size.
                        <Box
                            sx={{
                                border: '3px solid',
                                borderColor: 'primary.main',
                                borderRadius: 0,
                                p: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Content for tabs 1, 2, and 3 */}
                            {tabValue === 1 && <Typography variant="h6">Styling Options</Typography>}
                            {tabValue === 2 && <Typography variant="h6">OCPN Options</Typography>}
                            {tabValue === 3 && <Typography variant="h6">Editor</Typography>}
                        </Box>
                    )}
                    {(tabValue === 0 || !isSmallScreen) && (
                        // Always show the visualization area if screen big enough or tab 0 selected.
                        <Box
                            sx={{
                                border: '3px solid',
                                borderColor: 'primary.main',
                                borderRadius: 0,
                                p: 2,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            {/* Visualization area content goes here */}
                            <Typography variant="h6">Visualization</Typography>
                        </Box>

                    )}
                </Box>
            </Box>
        </CustomThemeProvider>
    );
};

export default Home;