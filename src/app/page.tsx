"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomThemeProvider from './context/CustomThemeProvider';
import Header from './components/Header';
import TabMenu from './components/TabMenu';
import VisualizationArea from './components/VisualizationArea';
import { SelectChangeEvent } from '@mui/material/Select';
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

    // TODO: allow for importing multiple OCPNs. Currently only supports importing one OCPN at a time
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
                        setImportedObjects(prev => {
                            const newImportedObjects = [...prev, ocpn];
                            setSelectedOCPN(newImportedObjects.length - 1); // Set the newly imported OCPN as selected
                            return newImportedObjects;
                        });
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

    const handleSelectChange = (event: SelectChangeEvent<number | "default">) => {
        const value = event.target.value;
        setSelectedOCPN(value === "default" ? null : value as number);
    };

return (
    <CustomThemeProvider darkMode={darkMode}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header
                onMenuClick={handleMenuClick}
                onImportClick={handleImportClick}
                onExportClick={() => { }} // TODO: Implement export functionality
                onToggleDarkMode={handleToggleDarkMode}
                darkMode={darkMode}
                importedObjects={importedObjects}
                selectedOCPN={selectedOCPN}
                handleSelectChange={handleSelectChange}
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
                    </Box>
                )}
                {(tabValue === 0 || !isSmallScreen) && <VisualizationArea selectedOCPN={selectedOCPN !== null ? importedObjects[selectedOCPN] : null} />}
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