"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VisualizationArea from './components/VisualizationArea';
import ImportDialog from './components/ImportDialog';
import ExportDialog from './components/ExportDialog';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import ObjectCentricPetriNet from './utils/classes/ObjectCentricPetriNet';
import OCPNConfig from './utils/classes/OCPNConfig';
import ApplySugiyamaButton from './components/ApplySugiyamaButton';
import HoverLegend from './components/HoverLegend';
import { visualizeOCPN } from './utils/lib/visualizationUtils';
import { select, zoom, zoomIdentity } from 'd3';

import './components/ConfigurationSidebar.css';
import sugiyama from './utils/sugiyama/sugiyama';


const COLORS_ARRAY: string[] = [
    '#99cefd', '#f5a800', '#002e57',
    "#FF5733", // Vibrant Red-Orange
    "#4285F4", // Modern Blue (Google Blue)
    "#34A853", // Fresh Green
    "#F4B400", // Warm Yellow
    "#DB4437", // Strong Red
    "#673AB7", // Deep Purple
    "#00ACC1", // Cool Cyan
    "#F06292", // Soft Pink
    "#E64A19", // Earthy Orange
    "#8BC34A", // Lime Green
    "#9C27B0", // Rich Violet
    "#FF9800", // Bright Orange
    "#3F51B5", // Classic Indigo
    "#00BCD4", // Bright Teal
    "#C2185B", // Bold Magenta
    "#FFD600", // Dazzling Yellow
    "#4CAF50", // Standard Green
    "#1976D2", // Deep Blue
    "#D81B60", // Vibrant Pink
    "#795548", // Modern Brown
];

const Home = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [importedObjects, setImportedObjects] = useState<ObjectCentricPetriNet[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [failedFiles, setFailedFiles] = useState<string[]>([]);
    const [selectedOCPN, setSelectedOCPN] = useState<number | null>(null);
    const [userConfig, setUserConfig] = useState<OCPNConfig>(new OCPNConfig());
    const [isImporting, setIsImporting] = useState(false);
    const [minScaleValue, setMinScaleValue] = useState(0.5);
    const [maxScaleValue, setMaxScaleValue] = useState(10);
    const [currentHover, setCurrentHover] = useState<string>('');
    const [sugiyamaAppliedSwitch, setSugiyamaAppliedSwitch] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const previousOCPNRef = useRef<ObjectCentricPetriNet | null>(null);

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
        setFailedFiles([]);
    };

    const applyConfigChanges = () => {
        handleVisualizationUpdate(null);
        setSugiyamaAppliedSwitch(!sugiyamaAppliedSwitch);
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
                select(svgRef.current).selectAll('*').remove();
                visualizeOCPN(ocpnLayout, userConfig, svgRef.current);
                // Initially zoom in/out out until the graph fits the svgRef.current?.clientWidht/Height.
                const svg = select(svgRef.current);
                const g = svg.select('g');
                const margin = userConfig.borderPadding;
                const bbox = (g.node() as SVGGraphicsElement)?.getBBox();
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
                setMaxScaleValue(initialScale * max * 100);

                // Apply the transformations directly to the g element
                g.attr('transform', `translate(${translateX}, ${translateY}) scale(${initialScale})`);

                // Apply the zoom behavior
                svg.call(zoom<SVGSVGElement, unknown>().transform, zoomIdentity.translate(translateX, translateY).scale(initialScale));

                // Set initial visibility of transition labels
                const zoomLevel = initialScale;
                svg.selectAll('.ocpntransition.label').style('display', zoomLevel < userConfig.zoomVisibilityThreshhold ? 'none' : 'block');

                // console.log("Initial zoom in/out with scale: ", initialScale, " and translation (x,y): ", translateX, translateY);
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
        let errorOccurred = false;
        const failedFilesList: string[] = [];

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
                                let correctOT = ot.replace(' ', '');
                                currentConfig.typeColorMapping.set(correctOT, COLORS_ARRAY[index % COLORS_ARRAY.length]);
                            });
                        }
                    } else {
                        setImportError(`Unsupported file type: ${file.name}`);
                        failedFilesList.push(file.name);
                        errorOccurred = true;
                    }
                } catch (error) {
                    setImportError(`Error importing file: ${error}`);
                    failedFilesList.push(file.name);
                    errorOccurred = true;
                } finally {
                    if (i === files.length - 1 && !errorOccurred) {
                        setImportedObjects(prev => {
                            const updatedImportedObjects = [...prev, ...newImportedObjects];
                            setSelectedOCPN(updatedImportedObjects.length - newImportedObjects.length);
                            setUserConfig(currentConfig);
                            handleImportClose();
                            setIsImporting(false);
                            return updatedImportedObjects;
                        });
                    } else if (i === files.length - 1) {
                        setFailedFiles(failedFilesList);
                        setIsImporting(false);
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
            let correctOT = ot.replace(' ', '');
            currentConfig.typeColorMapping.set(correctOT, COLORS_ARRAY[index % COLORS_ARRAY.length]);
        });
        setUserConfig(currentConfig);
    };


    return (
        <div>
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
                        setConfig={setUserConfig}
                        darkMode={darkMode}
                        sugiyamaAppliedSwitch={sugiyamaAppliedSwitch}
                        svgRef={svgRef} />
                    <ApplySugiyamaButton
                        darkMode={darkMode}
                        menuOpen={menuOpen}
                        onClick={applyConfigChanges} />
                    <HoverLegend
                        darkMode={darkMode}
                        currentHover={currentHover} />
                    <VisualizationArea
                        selectedOCPN={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                        userConfig={userConfig}
                        darkMode={darkMode}
                        svgRef={svgRef}
                        minScaleValue={minScaleValue}
                        maxScaleValue={maxScaleValue}
                        setCurrentHover={setCurrentHover}
                    />
                </div>
            </div>
            <ImportDialog
                darkMode={darkMode}
                importDialogOpen={importDialogOpen}
                onClose={handleImportClose}
                onDrop={handleDrop}
                onFileInputChange={handleFileInputChange}
                importError={importError}
                failedFiles={failedFiles}
            />
            <ExportDialog
                darkMode={darkMode}
                exportDialogOpen={exportDialogOpen}
                setExportDialogOpen={setExportDialogOpen}
                exportPossible={selectedOCPN !== null ? true : false}
                ocpn={selectedOCPN !== null ? importedObjects[selectedOCPN] : null}
                userConfig={userConfig}
                svgRef={svgRef}
            />
        </div>
    );
};

export default Home;