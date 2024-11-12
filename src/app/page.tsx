"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import CustomThemeProvider from './context/CustomThemeProvider';
import Header from './components/Header';
import TabMenu from './components/TabMenu';
import VisualizationArea from './components/VisualizationArea';

import Editor from './components/Editor';
import ImportDialog from './components/ImportDialog';

import ObjectCentricPetriNet from './utils/classes/ObjectCentricPetriNet';

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

    /**
     * Effect to update the dark mode state when the user changes their system preference.
     */
    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    /**
     * Effect to close the menu when the screen size is small.
     */
    useEffect(() => {
        if (isSmallScreen) {
            setMenuOpen(false);
        }
    }, [isSmallScreen]);

    /**
     * Handler to toggle the dark mode state.
     */
    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    /**
     * Handler to toggle the tabs menu.
     */
    const handleMenuClick = () => {
        setMenuOpen(!menuOpen);
    };

    /**
     * Handler to change the tab value.
     * @param event The event that triggered the change.
     * @param newValue The new tab value.
     */
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    /**
     * Handler to open the import dialog where the user can import OCPNs.
     */
    const handleImportClick = () => {
        setImportDialogOpen(true);
    };

    /**
     * Handler to close the import dialog.
     */
    const handleImportClose = () => {
        setImportDialogOpen(false);
        setImportError(null);
    };

    /**
     * Handler to import a file that contains a valid OCPN.
     * 
     * @param file The file to import (must be a JSON or PNML file).
     */
    const handleFileImport = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result;
            try {
                // Initialize the OCPN as null.
                let ocpn: ObjectCentricPetriNet | null = null;
                if (file.name.endsWith('.json')) {
                    // File is a JSON file.
                    ocpn = ObjectCentricPetriNet.fromJSON(JSON.parse(content as string));
                } else if (file.name.endsWith('.pnml')) {
                    // File is a PNML file.
                    ocpn = await ObjectCentricPetriNet.fromPNML(content as string);
                }
                // Check if the OCPN is valid and not already imported.
                if (ocpn) {
                    if (importedObjects.some(existingOCPN => existingOCPN.equals(ocpn))) {
                        // OCPN is already imported.
                        setImportError('OCPN Already imported');
                    } else {
                        // OCPN is valid and not already imported.
                        setImportedObjects((prev) => [...prev, ocpn]);
                        setSelectedOCPN(prev => prev === null ? 0 : prev);
                        handleImportClose();
                    }
                } else {
                    // Unsupported file type.
                    setImportError(`Unsupported file type: ${file.name}`);
                }
            } catch (error) {
                setImportError(`Error importing file: ${error}`);
            }
        }
        reader.readAsText(file);
    };

    /**
     * Handler to import a file that contains a valid OCPN.
     * 
     * @param event The event that triggered the change.
     */
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileImport(file);
        }
    };

    /**
     * Handler to handle the drop event when a file is dropped on the import dialog.
     * 
     * @param event The event that triggered the drop.
     */
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileImport(file);
        }
    };

    /**
     * Handler to select an imported OCPN.
     * 
     * @param event The event that triggered the click.
     * @param index The index of the OCPN to select.
     */
    const handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        setSelectedOCPN(index);
    }
    // TODO: Instead of having a seperate tab for the management of imported OCPNs, add a select to the header to switch between imported OCPNs.
    return (
        <CustomThemeProvider darkMode={darkMode}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Header
                    onMenuClick={handleMenuClick}
                    onImportClick={handleImportClick}
                    onExportClick={() => { }} // TODO: Implement export functionality
                    onToggleDarkMode={handleToggleDarkMode}
                />
                <TabMenu
                    open={menuOpen}
                    tabValue={tabValue}
                    handleTabChange={handleTabChange}
                />
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'grid',
                        gridTemplateColumns: tabValue === 0 || isSmallScreen ? '1fr' : 'auto 3fr',
                        overflow: 'hidden',
                    }}
                >
                    {tabValue !== 0 && (
                        <Box sx={{ bgcolor: 'background.paper', overflow: 'auto', mt: 2 }}>
                            {tabValue === 1 && <Typography variant="h6">Styling Options</Typography>}
                            {tabValue === 2 && <Typography variant="h6">OCPN Options</Typography>}
                            {tabValue === 3 &&
                                <Editor
                                    importedObjects={importedObjects}
                                    selectedOCPN={selectedOCPN}
                                    onListItemClick={handleListItemClick}
                                />
                            }
                        </Box>
                    )}
                    {(tabValue === 0 || !isSmallScreen) && <VisualizationArea selectedOCPN={selectedOCPN ? importedObjects[selectedOCPN] : null} />}
                </Box>
            </Box>
            <ImportDialog
                open={importDialogOpen}
                onClose={handleImportClose}
                onDrop={handleDrop}
                onFileInputChange={handleFileInputChange}
                importError={importError}
            />
        </CustomThemeProvider>
    );
};

export default Home;