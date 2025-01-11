import React, { useState, useEffect } from 'react';
import ConfigurationCategory from './ConfigurationCategory';
import CustomMultiSelect from './CustomMultiSelect';
import ConfigOption from './ConfigOption';
import DraggableListButton from './DraggableListButton';
import './ConfigurationSidebar.css';

import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    currentOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    darkMode: boolean;
}

const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({ isOpen, currentOCPN, userConfig, darkMode }) => {
    const mode = darkMode ? 'dark' : 'light';
    const sidebarClass = isOpen ? "sidebar open " + mode : "sidebar " + mode;
    // TODO: use effect on config options that depend on the current OCPN.
    const [indicateSourcesSinks, setIndicateSourcesSinks] = useState(userConfig.indicateSourcesSinks ?? false);
    const [flowDirection, setFlowDirection] = useState(userConfig.direction ?? 'TB');
    const [objectAttraction, setObjectAttraction] = useState(userConfig.objectAttraction ?? 0.1);
    const [objectAttractionRangeMin, setObjectAttractionRangeMin] = useState(userConfig.objectAttractionRangeMin ?? 1);
    const [objectAttractionRangeMax, setObjectAttractionRangeMax] = useState(userConfig.objectAttractionRangeMax ?? 2);
    const maxLayers = 4; // TODO: get length of layering.
    const [maxBarycenterIterations, setMaxBarycenterIterations] = useState(userConfig.maxBarycenterIterations ?? 4);
    const [backgroundColor, setBackgroundColor] = useState(userConfig.svgBackgroundColor ?? '#ffffff');
    const [placeRadius, setPlaceRadius] = useState(userConfig.placeRadius ?? 5);
    const [transitionWidth, setTransitionWidth] = useState(userConfig.transitionWidth ?? 20);
    const [silentTransitionWidth, setSilentTransitionWidth] = useState(userConfig.silentTransitionWidth ?? 10);
    const [transitionHeight, setTransitionHeight] = useState(userConfig.transitionHeight ?? 10);
    // const [dummySize, setDummySize] = useState(userConfig.dummySize ?? 5);
    const [layerSep, setLayerSep] = useState(userConfig.layerSep ?? 10);
    const [vertexSep, setVertexSep] = useState(userConfig.vertexSep ?? 10);
    const [defaultPlaceColor, setDefaultPlaceColor] = useState(userConfig.defaultPlaceColor ?? '#000000');
    const [transitionColor, setTransitionColor] = useState(userConfig.transitionColor ?? '#000000');
    const [transitionFillColor, setTransitionFillColor] = useState(userConfig.transitionFillColor ?? '#ffffff');
    const [transitionTextColor, setTransitionTextColor] = useState(userConfig.transitionTextColor ?? '#000');
    const [transitionBorderSize, setTransitionBorderSize] = useState(userConfig.transitionBorderSize ?? 1);
    const [indicateArcWeight, setIndicateArcWeight] = useState(userConfig.indicateArcWeight ?? false);
    const [indicateVariableArcs, setIndicateVariableArcs] = useState(userConfig.indicateVariableArcs ?? true);
    const [arcSize, setArcSize] = useState(userConfig.arcSize ?? 1);
    const [arcDefaultColor, setArcDefaultColor] = useState(userConfig.arcDefaultColor ?? '#000000');
    const [zoomVisibilityThreshhold, setZoomVisibilityThreshhold] = useState(userConfig.zoomVisibilityThreshhold ?? 0);
    const [highlightOpacity, setHighlightOpacity] = useState(userConfig.highlightOpacity ?? 0.2);
    const [variableArcIndicatorColor, setVariableArcIndicatorColor] = useState(userConfig.variableArcIndicatorColor ?? '#ff0000');
    const [variableArcIndicatorSize, setVariableArcIndicatorSize] = useState(userConfig.variableArcIndicatorSize ?? 3);

    const [seeAlignmentType, setSeeAlignmentType] = useState(userConfig.seeAlignmentType ?? false);
    const [alignmentType, setAlignmentType] = useState(userConfig.alignmentType ?? 'downLeft');
    interface SetUserConfig {
        <K extends keyof OCPNConfig>(value: OCPNConfig[K], attribute: K): void;
    }

    const [configHistory, setConfigHistory] = useState([{ config: { ...userConfig }, description: 'Initial configuration' }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const clearHistory = () => {
        setConfigHistory([{ config: { ...userConfig }, description: 'Initial configuration' }]);
        setCurrentHistoryIndex(0);
    }

    // const addHistoryEntry = (attribute: keyof OCPNConfig) => {
    //     const description = `Changed ${attribute} to ${userConfig[attribute]}`;
    //     const newHistory = [...configHistory.slice(0, currentHistoryIndex + 1), { config: { ...userConfig }, description }];
    //     setConfigHistory(newHistory);
    //     setCurrentHistoryIndex(newHistory.length - 1);
    // }

    const setUserConfig: SetUserConfig = (value, attribute) => {
        userConfig[attribute] = value;
        // addHistoryEntry(attribute);
    }

    // const restoreConfig = (config: OCPNConfig, index: number) => {
    //     Object.keys(config).forEach((key) => {
    //         handleConfigChange(key as keyof OCPNConfig, config[key as keyof OCPNConfig], false);
    //     });
    //     setCurrentHistoryIndex(index);
    // }

    const handleConfigChange = (attribute: keyof OCPNConfig, value: any, change = true) => {
        switch (attribute) {
            case 'indicateSourcesSinks':
                setIndicateSourcesSinks(value);
                break;
            case 'direction':
                setFlowDirection(value);
                break;
            case 'objectAttraction':
                setObjectAttraction(value);
                break;
            case 'objectAttractionRangeMin':
                setObjectAttractionRangeMin(value);
                break;
            case 'objectAttractionRangeMax':
                setObjectAttractionRangeMax(value);
                break;
            case 'maxBarycenterIterations':
                setMaxBarycenterIterations(value);
                break;
            case 'svgBackgroundColor':
                setBackgroundColor(value);
                break;
            case 'placeRadius':
                setPlaceRadius(value);
                break;
            case 'transitionWidth':
                setTransitionWidth(value);
                break;
            case 'silentTransitionWidth':
                setSilentTransitionWidth(value);
                break;
            case 'transitionHeight':
                setTransitionHeight(value);
                break;
            // case 'dummySize':
            //     setDummySize(value);
            //     break;
            case 'layerSep':
                setLayerSep(value);
                break;
            case 'vertexSep':
                setVertexSep(value);
                break;
            case 'defaultPlaceColor':
                setDefaultPlaceColor(value);
                break;
            case 'transitionColor':
                setTransitionColor(value);
                break;
            case 'transitionFillColor':
                setTransitionFillColor(value);
                break;
            case 'transitionTextColor':
                setTransitionTextColor(value);
                break;
            case 'transitionBorderSize':
                setTransitionBorderSize(value);
                break;
            case 'indicateArcWeight':
                setIndicateArcWeight(value);
                break;
            case 'indicateVariableArcs':
                setIndicateVariableArcs(value);
                break;
            case 'arcSize':
                setArcSize(value);
                break;
            case 'arcDefaultColor':
                setArcDefaultColor(value);
                break;
            case 'zoomVisibilityThreshhold':
                setZoomVisibilityThreshhold(value);
                break;
            case 'highlightOpacity':
                setHighlightOpacity(value);
                break;
            case 'variableArcIndicatorColor':
                setVariableArcIndicatorColor(value);
                break;
            case 'variableArcIndicatorSize':
                setVariableArcIndicatorSize(value);
                break;
            case 'seeAlignmentType':
                setSeeAlignmentType(value);
                break;
            case 'alignmentType':
                setAlignmentType(value);
                break;
            default:
                break;
        }
        if (change) {
            setUserConfig(value, attribute);
        }
    };

    const handleInputChange = (attribute: keyof OCPNConfig, change = false) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' || e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        handleConfigChange(attribute, value, change);
    };

    const handleMouseUp = (attribute: keyof OCPNConfig) => (e: React.MouseEvent<HTMLInputElement>) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        handleConfigChange(attribute, value);
    };

    const handleColorChange = (attribute: keyof OCPNConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleConfigChange(attribute, value, false);
    };

    const handleColorBlur = (attribute: keyof OCPNConfig) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleConfigChange(attribute, value, true);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const objectType = e.target.value;
        const color = userConfig.typeColorMapping.get(objectType.replace(' ', '')) || '#000000';
        setCurrentTypeKey(objectType);
        setCurrentTypeColor(color);
        console.log(`${objectType}: ${color}`);
    }

    const handleColorMappingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCurrentTypeColor(color);
        userConfig.typeColorMapping.set(currentTypeKey, color);
        console.log(`${currentTypeKey}: ${color}`);
    }

    const [currentTypeKey, setCurrentTypeKey] = useState(userConfig.includedObjectTypes[0]);
    const [currentTypeColor, setCurrentTypeColor] = useState(userConfig.typeColorMapping.get(currentTypeKey));

    useEffect(() => {
        setCurrentTypeKey(userConfig.includedObjectTypes[0]);
        setCurrentTypeColor(userConfig.typeColorMapping.get(userConfig.includedObjectTypes[0]));
    }, [userConfig.includedObjectTypes]);

    return (
        <div className={sidebarClass}>
            <ConfigurationCategory title="Object Configurations" darkMode={darkMode} categoryIndex={0}>
                <div style={{ paddingLeft: '4%' }}>
                    {(currentOCPN !== null) ? (
                        <>
                            {/* multi select */}
                            <CustomMultiSelect
                                darkMode={darkMode}
                                currentOCPN={currentOCPN}
                                userConfig={userConfig}
                            />
                            <ConfigOption label="Type to color mapping" darkMode={darkMode}>
                                <select
                                    className={`custom-configuration-select${darkMode ? ' dark' : ' light'}`}
                                    value={currentTypeKey ?? userConfig.includedObjectTypes[0]}
                                    onChange={handleTypeChange}
                                >
                                    {userConfig.includedObjectTypes.map((objectType: string) => (
                                        <option key={objectType} value={objectType}>{objectType}</option>
                                    ))}
                                </select>
                                <input
                                    type='color'
                                    className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                                    value={currentTypeColor ?? userConfig.typeColorMapping.get(userConfig.includedObjectTypes[0].replace(' ', ''))}
                                    onChange={handleColorMappingChange}
                                />
                            </ConfigOption>
                            <ConfigOption label="Adjust initial order" darkMode={darkMode}>
                                <DraggableListButton
                                    buttonLabel="Drag and drop to reorder"
                                    darkMode={darkMode}
                                    userConfig={userConfig}
                                />
                            </ConfigOption>
                            <ConfigOption label="Sources and sinks" darkMode={darkMode}>
                                Right-click places to add / remove sources and sinks. {/* See ...\Components\D3\index.html as example. */}
                                <br />
                                <button
                                    onClick={() => { console.log("TODO: Reset sources and sinks"); }}
                                    className={`custom-configuration-button${darkMode ? ' dark' : ' light'}`}
                                >
                                    Reset
                                </button>
                            </ConfigOption>
                        </>
                    ) : (
                        <div style={{ padding: '3%' }}>
                            <div>
                                These configuration options will be available once you import an OCPN.
                            </div>
                        </div>
                    )}
                </div>
            </ConfigurationCategory >
            <ConfigurationCategory title="Sugiyama Configurations" darkMode={darkMode} categoryIndex={1}>
                <div style={{ paddingLeft: '4%' }}>
                    <ConfigOption label="Flow direction" darkMode={darkMode}>
                        <select
                            className={`custom-configuration-select${darkMode ? ' dark' : ' light'}`}
                            value={flowDirection}
                            onChange={handleInputChange('direction', true)}
                        >
                            <option value="TB">Top to Bottom</option>
                            <option value="LR">Left to Right</option>
                        </select>
                    </ConfigOption>
                    <ConfigOption label="Object attraction" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={0.5}
                            value={objectAttraction}
                            step={0.05}
                            onChange={handleInputChange('objectAttraction')}
                            onMouseUp={handleMouseUp('objectAttraction')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Object attraction range start" darkMode={darkMode}>
                        <input
                            type='number'
                            className={`custom-number-input${darkMode ? ' dark' : ' light'}`}
                            min={1}
                            max={objectAttractionRangeMax}
                            value={objectAttractionRangeMin}
                            onChange={handleInputChange('objectAttractionRangeMin', true)}
                        />
                    </ConfigOption>
                    <ConfigOption label="Object attraction range end" darkMode={darkMode}>
                        <input
                            type='number'
                            className={`custom-number-input${darkMode ? ' dark' : ' light'}`}
                            min={objectAttractionRangeMin}
                            max={maxLayers} // TODO check correctness
                            value={objectAttractionRangeMax}
                            onChange={handleInputChange('objectAttractionRangeMax', true)}
                        />
                    </ConfigOption>
                    <ConfigOption label="Max barycenter iterations" darkMode={darkMode}>
                        <input
                            type='number'
                            className={`custom-number-input${darkMode ? ' dark' : ' light'}`}
                            min={4}
                            max={100} // TODO: check what fits
                            value={maxBarycenterIterations}
                            onChange={handleInputChange('maxBarycenterIterations', true)}
                        />
                    </ConfigOption>
                    {/* <ConfigOption label="Alignment type" darkMode={darkMode}>
                        <select
                            className={`custom-configuration-select${darkMode ? ' dark' : ' light'}`}
                            value={alignmentType}
                            onChange={handleInputChange('alignmentType', true)}
                            disabled={!seeAlignmentType}
                        >
                            <option value="downLeft">Down Left</option>
                            <option value="downRight">Down Right</option>
                            <option value="upLeft">Up Left</option>
                            <option value="upRight">Up Right</option>
                        </select>
                        <input
                            type="checkbox"
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={seeAlignmentType}
                            onChange={handleInputChange('seeAlignmentType', true)}
                        />
                    </ConfigOption> */}
                </div>
            </ConfigurationCategory >
            <ConfigurationCategory title="Styling Configurations" darkMode={darkMode} categoryIndex={2}>
                <div style={{ paddingLeft: '4%' }}>

                    <span className={`sub-category-heading${darkMode ? ' dark' : ' light'}`}>Sizes</span>

                    <ConfigOption label="Layer separation" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={40}
                            value={layerSep}
                            step={1}
                            onChange={handleInputChange('layerSep')}
                            onMouseUp={handleMouseUp('layerSep')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Vertex separation" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={40}
                            value={vertexSep}
                            step={1}
                            onChange={handleInputChange('vertexSep')}
                            onMouseUp={handleMouseUp('vertexSep')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Place radius" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={3}
                            max={20}
                            value={placeRadius}
                            step={0.2}
                            onChange={handleInputChange('placeRadius')}
                            onMouseUp={handleMouseUp('placeRadius')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition width" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={20}
                            max={50}
                            value={transitionWidth}
                            step={1}
                            onChange={handleInputChange('transitionWidth')}
                            onMouseUp={handleMouseUp('transitionWidth')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition height" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={5}
                            max={20}
                            value={transitionHeight}
                            step={1}
                            onChange={handleInputChange('transitionHeight')}
                            onMouseUp={handleMouseUp('transitionHeight')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition border size" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0.1}
                            max={2}
                            value={transitionBorderSize}
                            step={0.05}
                            onChange={handleInputChange('transitionBorderSize')}
                            onMouseUp={handleMouseUp('transitionBorderSize')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Silent transition width" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={3}
                            max={30}
                            value={silentTransitionWidth}
                            step={1}
                            onChange={handleInputChange('silentTransitionWidth')}
                            onMouseUp={handleMouseUp('silentTransitionWidth')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Arc size" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0.1}
                            max={5} // TODO: reset to 2
                            step={0.05}
                            value={arcSize}
                            onChange={handleInputChange('arcSize')}
                            onMouseUp={handleMouseUp('arcSize')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Variable arc indicator size" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={1.1}
                            max={10.1}
                            step={1}
                            value={variableArcIndicatorSize}
                            onChange={handleInputChange('variableArcIndicatorSize')}
                            onMouseUp={handleMouseUp('variableArcIndicatorSize')}
                        />
                    </ConfigOption>
                    {/* <ConfigOption label="Dummy size" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={10}
                            value={dummySize}
                            step={1}
                            onChange={handleInputChange('dummySize')}
                            onMouseUp={handleMouseUp('dummySize')}
                        />
                    </ConfigOption> */}

                    <span className={`sub-category-heading${darkMode ? ' dark' : ' light'}`}>Colors</span>

                    <ConfigOption label="Background color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={backgroundColor}
                            onChange={handleColorChange('svgBackgroundColor')}
                            onBlur={handleColorBlur('svgBackgroundColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionColor}
                            onChange={handleInputChange('transitionColor')}
                            onBlur={handleColorBlur('transitionColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition fill color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionFillColor}
                            onChange={handleColorChange('transitionFillColor')}
                            onBlur={handleColorBlur('transitionFillColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Transition text color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionTextColor}
                            onChange={handleColorChange('transitionTextColor')}
                            onBlur={handleColorBlur('transitionTextColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Variable arc indicator color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={variableArcIndicatorColor}
                            onChange={handleColorChange('variableArcIndicatorColor')}
                            onBlur={handleColorBlur('variableArcIndicatorColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Default place color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={defaultPlaceColor}
                            onChange={handleColorChange('defaultPlaceColor')}
                            onBlur={handleColorBlur('defaultPlaceColor')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Arc default color" darkMode={darkMode}>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={arcDefaultColor}
                            onChange={handleColorChange('arcDefaultColor')}
                            onBlur={handleColorBlur('arcDefaultColor')}
                        />
                    </ConfigOption>

                    <span className={`sub-category-heading${darkMode ? ' dark' : ' light'}`}>Other</span>

                    <ConfigOption label="Indicate sources and sinks" darkMode={darkMode}>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={indicateSourcesSinks}
                            onChange={handleInputChange('indicateSourcesSinks', true)}
                        />
                    </ConfigOption>
                    <ConfigOption label="Indicate arc weight" darkMode={darkMode}>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={indicateArcWeight}
                            onChange={handleInputChange('indicateArcWeight', true)}
                        />
                    </ConfigOption>
                    <ConfigOption label="Indicate variable arcs" darkMode={darkMode}>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={indicateVariableArcs}
                            onChange={handleInputChange('indicateVariableArcs', true)}
                        />
                    </ConfigOption>
                    <ConfigOption label="Hide labels at zoom factor" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={10}
                            step={0.1}
                            value={zoomVisibilityThreshhold}
                            onChange={handleInputChange('zoomVisibilityThreshhold')}
                            onMouseUp={handleMouseUp('zoomVisibilityThreshhold')}
                        />
                    </ConfigOption>
                    <ConfigOption label="Highlight opacity" darkMode={darkMode}>
                        <input
                            type='range'
                            className={`custom-range-input${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={1}
                            step={0.05}
                            value={highlightOpacity}
                            onChange={handleInputChange('highlightOpacity')}
                            onMouseUp={handleMouseUp('highlightOpacity')}
                        />
                    </ConfigOption>
                </div>
            </ConfigurationCategory>
            {/* <ConfigurationCategory title="History" darkMode={darkMode} categoryIndex={3}>
                <div style={{ paddingLeft: '4%' }}>
                    <div>
                        <button onClick={clearHistory}>Clear History</button>
                        {configHistory.map((logEntry, index) => (
                            <div key={index} style={{ color: index === currentHistoryIndex ? 'red' : 'inherit' }}>
                                <button onClick={() => restoreConfig(logEntry.config, index)}>{index}. {logEntry.description}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </ConfigurationCategory> */}
        </div >
    );
}

export default ConfigurationSidebar;