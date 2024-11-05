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
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useTheme from '@mui/material/styles/useTheme';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomThemeProvider from './context/CustomThemeProvider';
import ObjectCentricPetriNet from './utils/classes/ObjectCentricPetriNet';
import { Divider } from '@mui/material';

const Home = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const isSmallScreen = useMediaQuery('(max-width: 900px)'); // Adjust the threshold as needed
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    const [menuOpen, setMenuOpen] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importedObjects, setImportedObjects] = useState<ObjectCentricPetriNet[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [selectedOCPN, setSelectedOCPN] = useState<number | null>(null);
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

    const handleImportClick = () => {
        setImportDialogOpen(true);
    };

    const handleImportClose = () => {
        setImportDialogOpen(false);
        setImportError(null);
    };

    const handleFileImport = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result;
            try {
                let ocpn: ObjectCentricPetriNet | null = null;
                if (file.name.endsWith('.json')) {
                    ocpn = ObjectCentricPetriNet.fromJSON(JSON.parse(content as string));
                } else if (file.name.endsWith('.pnml')) {
                    ocpn = await ObjectCentricPetriNet.fromPNML(content as string);
                }

                if (ocpn) {
                    if (importedObjects.some(existingOCPN => existingOCPN.equals(ocpn))) {
                        setImportError('OCPN Already imported');
                    } else {
                        setImportedObjects((prev) => [...prev, ocpn]);
                        setSelectedOCPN(prev => prev === null ? 0 : prev);
                        handleImportClose();
                    }
                } else {
                    setImportError(`Unsupported file type: ${file.name}`);
                }
            } catch (error) {
                setImportError(`Error importing file: ${error}`);
            }
        }
        reader.readAsText(file);
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileImport(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileImport(file);
        }
    };

    const handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        setSelectedOCPN(index);
    }

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
                        <Button color="inherit" onClick={handleImportClick}>Import</Button>
                        <Button color="inherit">Export</Button>
                        <IconButton edge="end" color="inherit" aria-label="toggle dark mode" onClick={handleToggleDarkMode}>
                            <Brightness4Icon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Collapse in={menuOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ width: '100%', bgcolor: 'background.default', marginBottom: '1%', paddingX: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="secondary"
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
                        gridTemplateColumns: tabValue === 0 || isSmallScreen ? '1fr' : 'auto 3fr',
                        overflow: 'hidden',
                    }}
                >
                    {tabValue !== 0 && (
                        // Always show the content of the configuration tabs no matter the screen size.
                        <Box
                            sx={{
                                bgcolor: 'background.paper',
                                overflow: 'auto',
                                mt: 2,
                            }}
                        >
                            {/* Content for tabs 1, 2, and 3 */}
                            {tabValue === 1 && <Typography variant="h6">Styling Options</Typography>}
                            {tabValue === 2 && <Typography variant="h6">OCPN Options</Typography>}
                            {tabValue === 3 && (
                                <Box sx={{ width: '100%', bgcolor: 'background.paper', m: 0, p: 0 }}>
                                    <List sx={{ m: 0, p: 0 }}>
                                        {importedObjects.map((obj, index) => (
                                            <ListItemButton
                                                key={index}
                                                selected={selectedOCPN === index}
                                                onClick={(event) => handleListItemClick(event, index)}
                                                sx={{ marginY: 1, bgcolor: selectedOCPN === index ? 'background.default' : 'background.paper' }}
                                            >
                                                <ListItemText primary={obj.name} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    )}
                    {(tabValue === 0 || !isSmallScreen) && (
                        // Always show the visualization area if screen big enough or tab 0 selected.
                        <Box
                            sx={{
                                border: '2px dotted',
                                borderColor: 'primary.main',
                                borderRadius: 0,
                                m: 2,
                                p: 2,
                                overflow: 'auto',
                                position: 'relative',
                            }}
                        >
                            {/* Visualization area content goes here */}
                            <Typography variant="h6">Visualization</Typography>
                        </Box>

                    )}
                </Box>
            </Box>
            <Dialog open={importDialogOpen} onClose={handleImportClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', bgcolor: 'background.default', color: 'primary.main' }}>
                    Import File
                    <Box sx={{ borderBottom: 2, borderColor: 'primary.main', mt: 1 }} />
                </DialogTitle>
                <DialogContent sx={{ bgcolor: 'background.default', color: 'primary.main' }}>
                    <Typography variant="body1" sx={{ mb: 2, color: 'primary.main' }}>
                        Please select a .json or .pnml file to import an Object-Centric Petri Net:
                    </Typography>
                    <Box
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('fileInput')?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            borderRadius: 1,
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px', // Increased height
                            color: 'primary.main'
                        }}
                    >
                        <Typography variant="body1" sx={{ mb: 2, color: 'primary.main' }}>
                            Drag and drop file here or click to select
                        </Typography>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".json,.pnml"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                    </Box>
                    {importError && <Alert severity="error" sx={{ mt: 2, color: 'text.primary' }}>{importError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ bgcolor: 'background.default', color: 'primary.main' }}>
                    <Button onClick={handleImportClose} color="inherit">Cancel</Button>
                </DialogActions>
            </Dialog>
        </CustomThemeProvider>
    );
}

export default Home;