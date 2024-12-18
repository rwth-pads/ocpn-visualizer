"use client";

import React, { useState, useEffect, useRef } from 'react';import useMediaQuery from '@mui/material/useMediaQuery';
import CustomThemeProvider from './context/CustomThemeProvider';
import Header from './components/Header';
import VisualizationArea from './components/VisualizationArea';
import { SelectChangeEvent } from '@mui/material/Select';
import ImportDialog from './components/ImportDialog';
import ExportDialog from './components/ExportDialog';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import LegendComponent from './components/LegendComponent';
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
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [importedObjects, setImportedObjects] = useState<ObjectCentricPetriNet[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [selectedOCPN, setSelectedOCPN] = useState<number | null>(null);
    const [userConfig, setUserConfig] = useState<OCPNConfig>(new OCPNConfig());
    const [changed, setChanged] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [minScaleValue, setMinScaleValue] = useState(0.5);
    const [maxScaleValue, setMaxScaleValue] = useState(10);
    const [legendOpen, setLegendOpen] = useState(false);

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

    const handleExportClick = () => {
        setExportDialogOpen(true);
    }

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
                // Initially zoom in/out out until the graph fits the svgRef.current?.clientWidht/Height.
                const svg = d3.select(svgRef.current);
                const g = svg.select('g');
                const margin = userConfig.borderPaddingX;
                const bbox = g.node()?.getBBox();
                const totalWidth = bbox ? bbox.width : 0;
                const totalHeight = bbox ? bbox.height : 0;
                const widthRatio = svgRef.current?.clientWidth ? (svgRef.current?.clientWidth - margin) / totalWidth : 1;
                const heightRatio = svgRef.current?.clientHeight ? (svgRef.current?.clientHeight - margin) / totalHeight : 1;
                const initialScale = Math.min(widthRatio, heightRatio);
                // Calculate the translation values
                const translateX = (svgRef.current.clientWidth - totalWidth * initialScale) / 2 - bbox.x * initialScale;
                const translateY = (svgRef.current.clientHeight - totalHeight * initialScale) / 2 - bbox.y * initialScale;

                // Set the min and max zoom scale values.
                let max = Math.max(ocpnLayout.layering.length, Math.max(...ocpnLayout.layering.map((layer: any[]) => layer.length)));
                setMinScaleValue(initialScale - 0.5);
                setMaxScaleValue(initialScale * max);

                // Apply the transformations directly to the g element
                g.attr('transform', `translate(${translateX}, ${translateY}) scale(${initialScale})`);

                // Apply the zoom behavior
                svg.call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity.translate(translateX, translateY).scale(initialScale));

                // Set initial visibility of transition labels
                const zoomLevel = initialScale;
                svg.selectAll('.ocpntransition.label').style('display', zoomLevel < userConfig.zoomVisibilityThreshhold ? 'none' : 'block');

                console.log("Initial zoom in/out with scale: ", initialScale, " and translation (x,y): ", translateX, translateY);
            } else {
                // console.log("SVG does not exist");
            }
            previousOCPNRef.current = thisOCPN;
        } else {
            // console.log("No OCPN to visualize");
        }
    }

    const handleFileImport = async (files: FileList) => {
        if (isImporting) return;
        setIsImporting(true);

        const newImportedObjects: ObjectCentricPetriNet[] = [];
        const currentConfig = userConfig;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
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
                        newImportedObjects.push(ocpn);
                        if (i === 0) {
                            // Get the included object types from the first imported OCPN.
                            currentConfig.includedObjectTypes = Array.from(ocpn.objectTypes);
                            // Get the sources and sinks from the first imported OCPN.
                            currentConfig.sources = ocpn.places.filter(place => place.initial).map(place => place.id);
                            currentConfig.sinks = ocpn.places.filter(place => place.final).map(place => place.id);
                            // Get the type to color mapping from the first imported OCPN.
                            currentConfig.typeColorMapping = new Map<string, string>();
                            currentConfig.includedObjectTypes.forEach((ot, index) => {
                                currentConfig.typeColorMapping.set(ot, COLORS_ARRAY[index % COLORS_ARRAY.length]);
                            });
                        }
                    } else {
                        setImportError(`Unsupported file type: ${file.name}`);
                    }
                } catch (error) {
                    setImportError(`Error importing file: ${error}`);
                } finally {
                    if (i === files.length - 1) {
                        setImportedObjects(prev => {
                            const updatedImportedObjects = [...prev, ...newImportedObjects];
                            setSelectedOCPN(updatedImportedObjects.length - newImportedObjects.length);
                            setUserConfig(currentConfig);
                            handleImportClose();
                            setIsImporting(false);
                            return updatedImportedObjects;
                        });
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            handleFileImport(files);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files) {
            handleFileImport(files);
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedOCPN(value === "default" ? null : parseInt(value));
        // Update the user config settings that are based on the OCPN.
        let currentConfig = userConfig;
        let ocpn = importedObjects[value as unknown as number];
        // Included object types
        currentConfig.includedObjectTypes = Array.from(importedObjects[parseInt(value)].objectTypes);
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
            <div className={`app`}>
                <Header
                    onMenuClick={handleMenuClick}
                    onImportClick={handleImportClick}
                    onExportClick={handleExportClick}
                    onToggleDarkMode={handleToggleDarkMode}
                    darkMode={darkMode}
                    importedObjects={importedObjects}
                    selectedOCPN={selectedOCPN}
                    handleSelectChange={handleSelectChange}
                />
                <div className={`app-container`}>
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
                        setChange={setChanged}
                        darkMode={darkMode}
                        svgRef={svgRef}
                        minScaleValue={minScaleValue}
                        maxScaleValue={maxScaleValue}
                    />
                    <LegendComponent
                        darkMode={darkMode}
                        userConfig={userConfig}
                        ocpn={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                        legendOpen={legendOpen}
                        setLegendOpen={setLegendOpen}
                        svgRef={svgRef} />
                    {/* <CenterButton
                        darkMode={darkMode}
                        centerVisualization={() => console.log("Todo")}
                        svg={svgRef} /> */}
                </div>
            </div>
            <ImportDialog
                open={importDialogOpen}
                onClose={handleImportClose}
                onDrop={handleDrop}
                onFileInputChange={handleFileInputChange}
                importError={importError}
            />
            <ExportDialog
                darkMode={darkMode}
                exportDialogOpen={exportDialogOpen}
                setExportDialogOpen={setExportDialogOpen}
                exportPossible={selectedOCPN !== null ? true : false}
                ocpn={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                svgRef={svgRef}
            />
        </CustomThemeProvider >
    );
};

export default Home;