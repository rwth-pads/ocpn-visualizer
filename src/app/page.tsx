"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import ApplySugiyamaButton from './components/ApplySugiyamaButton';
import { visualizeOCPN } from './utils/lib/visualizationUtils';
import * as d3 from 'd3';

import './components/ConfigurationSidebar.css';
import sugiyama from './utils/sugiyama/sugiyama';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

const Home = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    const [menuOpen, setMenuOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importedObjects, setImportedObjects] = useState<ObjectCentricPetriNet[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [selectedOCPN, setSelectedOCPN] = useState<number | null>(null);
    const [userConfig, setUserConfig] = useState<OCPNConfig>(new OCPNConfig());
    const [changed, setChanged] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const previousOCPNRef = useRef<ObjectCentricPetriNet | null>(null);

    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    useEffect(() => {
        if (selectedOCPN !== null) {
            applyConfigChanges();
        }
    }, [selectedOCPN]);

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

    const applyConfigChanges = () => {
        handleVisualizationUpdate(null);
        setChanged(false);
    }

    const handleVisualizationUpdate = async (ocpn: ObjectCentricPetriNet | null) => {
        let thisOCPN = null;
        if (selectedOCPN !== null) {
            thisOCPN = importedObjects[selectedOCPN];
        } else {
            thisOCPN = ocpn;
        }
        if (thisOCPN) {
            const ocpnLayout = await sugiyama(thisOCPN, userConfig);
            // console.log("OCPN Layout: ", ocpnLayout);
            if (!ocpnLayout) {
                return;
            }
            if (svgRef.current) {
                // console.log("SVG exists");
                d3.select(svgRef.current).selectAll('*').remove();
                visualizeOCPN(ocpnLayout, userConfig, svgRef.current);
            } else {
                // console.log("SVG does not exist");
            }
            previousOCPNRef.current = thisOCPN;
        } else {
            // console.log("No OCPN to visualize");
        }
    }

    // TODO: allow for importing multiple OCPNs. Currently only supports importing one OCPN at a time
    const handleFileImport = async (file: File) => {
        if (isImporting) return;
        setIsImporting(true);

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
                            setSelectedOCPN(newImportedObjects.length - 1);
                            let currentConfig = userConfig;
                            // Get the included object types from the imported OCPN.
                            currentConfig.includedObjectTypes = Array.from(ocpn.objectTypes);
                            // Get the sources and sinks from the imported OCPN.
                            currentConfig.sources = ocpn.places.filter(place => place.initial).map(place => place.id);
                            currentConfig.sinks = ocpn.places.filter(place => place.final).map(place => place.id);
                            // Get the type to color mapping from the imported OCPN.
                            currentConfig.typeColorMapping = new Map<string, string>();
                            currentConfig.includedObjectTypes.forEach((ot, index) => {
                                currentConfig.typeColorMapping.set(ot, COLORS_ARRAY[index % COLORS_ARRAY.length]);
                            });
                            // Update the user config settings based on the imported OCPN.
                            setUserConfig(currentConfig);
                            handleImportClose();
                            return newImportedObjects;
                        });
                    }
                } else {
                    setImportError(`Unsupported file type: ${file.name}`);
                }
            } catch (error) {
                setImportError(`Error importing file: ${error}`);
            } finally {
                setIsImporting(false);
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
        // Update the user config settings that are based on the OCPN.
        let currentConfig = userConfig;
        let ocpn = importedObjects[value as number];
        // Included object types
        currentConfig.includedObjectTypes = Array.from(importedObjects[value as number].objectTypes);
        // sources and sinks
        currentConfig.sources = ocpn.places.filter(place => place.initial).map(place => place.id);
        currentConfig.sinks = ocpn.places.filter(place => place.final).map(place => place.id);
        // type to color mapping
        currentConfig.typeColorMapping = new Map<string, string>();
        currentConfig.includedObjectTypes.forEach((ot, index) => {
            currentConfig.typeColorMapping.set(ot, COLORS_ARRAY[index % COLORS_ARRAY.length]);
        });
        setUserConfig(currentConfig);
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
                        setChange={setChanged}
                        darkMode={darkMode} />
                    <ApplySugiyamaButton
                        darkMode={darkMode}
                        menuOpen={menuOpen}
                        userConfig={userConfig}
                        changed={changed}
                        onClick={applyConfigChanges} />
                    <VisualizationArea
                        selectedOCPN={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                        userConfig={userConfig}
                        darkMode={darkMode}
                        svgRef={svgRef} />
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