"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomThemeProvider from './context/CustomThemeProvider';
import Header from './components/Header';
import VisualizationArea from './components/VisualizationArea';
import { SelectChangeEvent } from '@mui/material/Select';
import ImportDialog from './components/ImportDialog';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import ObjectCentricPetriNet from './utils/classes/ObjectCentricPetriNet';
import OCPNConfig from './utils/classes/OCPNConfig';

import './components/ConfigurationSidebar.css';

const Home = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    const [menuOpen, setMenuOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importedObjects, setImportedObjects] = useState<ObjectCentricPetriNet[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [selectedOCPN, setSelectedOCPN] = useState<number | null>(null);
    const [userConfig, setUserConfig] = useState<OCPNConfig>(new OCPNConfig());

    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    // Only for debugging purposes.
    useEffect(() => {
        console.log(userConfig.includedObjectTypes);
    }, [userConfig.includedObjectTypes]);

    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleMenuClick = () => {
        setMenuOpen(!menuOpen);
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
                            let currentConfig = userConfig;
                            currentConfig.includedObjectTypes = Array.from(ocpn.objectTypes);
                            setUserConfig(currentConfig);
                            // console.log(userConfig.includedObjectTypes);
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
        userConfig.includedObjectTypes = Array.from(importedObjects[value as number].objectTypes);
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
                <Box
                    sx={{
                        height: '90vh',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        top: '10vh',
                        left: 0,
                    }}
                >
                    <ConfigurationSidebar
                        isOpen={menuOpen}
                        currentOCPN={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                        userConfig={userConfig}
                        darkMode={darkMode} />

                    <button // Todo make this a component and use useEffect on userConfig to set visibility.
                        className={`apply-sugiyama-button${darkMode ? ' dark' : ' light'}${menuOpen ? ' open' : ''}`}
                        onClick={() => {console.log("Apply Sugiyama", userConfig.includedObjectTypes)}}
                        >⯈</button>
                    <VisualizationArea
                        selectedOCPN={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                        userConfig={userConfig}
                        darkMode={darkMode} />
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