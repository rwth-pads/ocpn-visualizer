import React, { useState } from 'react';
import ConfigurationCategory from './ConfigurationCategory';
import CustomMultiSelect from './CustomMultiSelect';
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

    const [flowDirection, setFlowDirection] = useState(userConfig.direction ?? 'TB');
    const [objectAttraction, setObjectAttraction] = useState(userConfig.objectAttraction ?? 0.1);
    const [objectAttractionRangeMin, setObjectAttractionRangeMin] = useState(userConfig.objectAttractionRangeMin ?? 1);
    const [objectAttractionRangeMax, setObjectAttractionRangeMax] = useState(userConfig.objectAttractionRangeMax ?? 2);
    const [maxBarycenterIterations, setMaxBarycenterIterations] = useState(userConfig.maxBarycenterIterations ?? 4);
    const [combineArcs, setCombineArcs] = useState(userConfig.combineArcs ?? false);
    const [placeRadius, setPlaceRadius] = useState(userConfig.placeRadius ?? 5);
    const [transitionCustomWidth, setTransitionCustomWidth] = useState(userConfig.transitionCustomWidth ?? false);
    const [transitionWidth, setTransitionWidth] = useState(userConfig.transitionWidth ?? 20);
    const [transitionHeight, setTransitionHeight] = useState(userConfig.transitionHeight ?? 10);
    const [dummySize, setDummySize] = useState(userConfig.dummySize ?? 5);
    const [layerSep, setLayerSep] = useState(userConfig.layerSep ?? 10);
    const [vertexSep, setVertexSep] = useState(userConfig.vertexSep ?? 10);
    const [defaultPlaceColor, setDefaultPlaceColor] = useState(userConfig.defaultPlaceColor ?? '#000000');
    const [transitionColor, setTransitionColor] = useState(userConfig.transitionColor ?? '#000000');
    const [transitionFillColor, setTransitionFillColor] = useState(userConfig.transitionFillColor ?? '#ffffff');
    const [transitionBorderSize, setTransitionBorderSize] = useState(userConfig.transitionBorderSize ?? 1);
    const [indicateArcWeight, setIndicateArcWeight] = useState(userConfig.indicateArcWeight ?? false);
    const [arcSize, setArcSize] = useState(userConfig.arcSize ?? 1);
    const [arrowHeadSize, setArrowHeadSize] = useState(userConfig.arrowHeadSize ?? 5);
    const [arcDefaultColor, setArcDefaultColor] = useState(userConfig.arcDefaultColor ?? '#000000');

    interface SetUserConfig {
        <K extends keyof OCPNConfig>(value: OCPNConfig[K], attribute: K): void;
    }

    const [configHistory, setConfigHistory] = useState([{ config: { ...userConfig }, description: 'Initial configuration' }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const clearHistory = () => {
        setConfigHistory([{ config: { ...userConfig }, description: 'Initial configuration' }]);
        setCurrentHistoryIndex(0);
    }

    const addHistoryEntry = (attribute: keyof OCPNConfig) => {
        const description = `Changed ${attribute} to ${userConfig[attribute]}`;
        const newHistory = [...configHistory.slice(0, currentHistoryIndex + 1), { config: { ...userConfig }, description }];
        setConfigHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    }

    const setUserConfig: SetUserConfig = (value, attribute) => {
        userConfig[attribute] = value;
        addHistoryEntry(attribute);
    }

    const restoreConfig = (config: OCPNConfig, index: number) => {
        Object.keys(config).forEach((key) => {
            handleConfigChange(key as keyof OCPNConfig, config[key as keyof OCPNConfig], false);
        });
        setCurrentHistoryIndex(index);
    }

    const handleConfigChange = (attribute: keyof OCPNConfig, value: any, change = true) => {
        switch (attribute) {
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
            case 'combineArcs':
                setCombineArcs(value);
                break;
            case 'placeRadius':
                setPlaceRadius(value);
                break;
            case 'transitionCustomWidth':
                setTransitionCustomWidth(value);
                break;
            case 'transitionWidth':
                setTransitionWidth(value);
                break;
            case 'transitionHeight':
                setTransitionHeight(value);
                break;
            case 'dummySize':
                setDummySize(value);
                break;
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
            case 'transitionBorderSize':
                setTransitionBorderSize(value);
                break;
            case 'indicateArcWeight':
                setIndicateArcWeight(value);
                break;
            case 'arcSize':
                setArcSize(value);
                break;
            case 'arrowHeadSize':
                setArrowHeadSize(value);
                break;
            case 'arcDefaultColor':
                setArcDefaultColor(value);
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
                                userConfig={userConfig} />
                            {/* one select for object types + transition, one select which vertex -> highlict hovered vertex */}
                            <div>Sources and sinks</div>
                            <div>Indicate sources, sinks with custom styling checkbox</div>
                            {/* List of names and corresponding color pickers */}
                            <div>type to color mapping</div>
                        </>
                    ) : (
                        <div style={{ padding: '3%' }}>
                            <div>
                                These configuration options will be available once you import an OCPN.
                            </div>
                        </div>
                    )}
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Sugiyama Configurations" darkMode={darkMode} categoryIndex={1}>
                <div style={{ paddingLeft: '4%' }}>
                    <div style={{ padding: '3% 0' }}>
                        <label className='custom-configuration-label' htmlFor='flow-direction'>Flow Direction</label>
                        <select
                            id="flow-direction"
                            className={`custom-configuration-select${darkMode ? ' dark' : ' light'}`}
                            value={flowDirection}
                            onChange={handleInputChange('direction', true)}
                        >
                            <option value="TB">Top to Bottom</option>
                            <option value="LR">Left to Right</option>
                        </select>
                    </div>
                    {/* TODO: Not urgent */}
                    <div>objectCentrality: TODO</div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='object-attraction'>Object Attraction</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={0.5}
                            value={objectAttraction}
                            step={0.05}
                            onChange={handleInputChange('objectAttraction')}
                            onMouseUp={handleMouseUp('objectAttraction')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='range-min'>Object Attraction Range Start</label>
                        <input
                            type='number'
                            className={`custom-configuration-input${darkMode ? ' dark' : ' light'}`}
                            min={1}
                            max={objectAttractionRangeMax}
                            value={objectAttractionRangeMin}
                            onChange={handleInputChange('objectAttractionRangeMin', true)}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='range-max'>Object Attraction Range End</label>
                        <input
                            type='number'
                            className={`custom-configuration-input${darkMode ? ' dark' : ' light'}`}
                            min={objectAttractionRangeMin}
                            max={4} // TODO: get the number of layers from the OCPNLayout depending on the Petri Net.
                            value={objectAttractionRangeMax}
                            onChange={handleInputChange('objectAttractionRangeMax', true)}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='max-barycenter-iterations'>Max Barycenter Iterations</label>
                        <input
                            type='number'
                            className={`custom-configuration-input${darkMode ? ' dark' : ' light'}`}
                            min={4}
                            max={100} // TODO: check what fits
                            value={maxBarycenterIterations}
                            onChange={handleInputChange('maxBarycenterIterations', true)}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='combine-arcs'>Combine Long Arcs</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={combineArcs}
                            onChange={handleInputChange('combineArcs', true)}
                        />
                    </div>
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Styling Configurations" darkMode={darkMode} categoryIndex={2}>
                {/* Add subheadings: sizing, colors */}
                <div style={{ paddingLeft: '4%' }}>
                    <div>
                        <label className='custom-configuration-label' htmlFor='place-radius'>Place radius</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={3}
                            max={20}
                            value={placeRadius}
                            step={1}
                            onChange={handleInputChange('placeRadius')}
                            onMouseUp={handleMouseUp('placeRadius')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-custom-width'>Use custom transition width</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={transitionCustomWidth}
                            onChange={handleInputChange('transitionCustomWidth', true)}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-width'>Transition Width</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={20}
                            max={50}
                            value={transitionWidth}
                            step={1}
                            onChange={handleInputChange('transitionWidth')}
                            onMouseUp={handleMouseUp('transitionWidth')}
                            disabled={transitionCustomWidth}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-height'>Transition Height</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={5}
                            max={20}
                            value={transitionHeight}
                            step={1}
                            onChange={handleInputChange('transitionHeight')}
                            onMouseUp={handleMouseUp('transitionHeight')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='dummy-size'>Dummy Size</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={10}
                            value={dummySize}
                            step={1}
                            onChange={handleInputChange('dummySize')}
                            onMouseUp={handleMouseUp('dummySize')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='layer-sep'>Layer Separation</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={3}
                            max={40}
                            value={layerSep}
                            step={1}
                            onChange={handleInputChange('layerSep')}
                            onMouseUp={handleMouseUp('layerSep')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='vertex-sep'>Vertex Separation</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={0}
                            max={20}
                            value={vertexSep}
                            step={1}
                            onChange={handleInputChange('vertexSep')}
                            onMouseUp={handleMouseUp('vertexSep')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='default-place-color'>Default place color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={defaultPlaceColor}
                            onChange={handleColorChange('defaultPlaceColor')}
                            onBlur={handleColorBlur('defaultPlaceColor')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor=''>checkbox fill places? - color fill - border radius</label>
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-color'>Transition color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionColor}
                            onChange={handleInputChange('transitionColor')}
                            onBlur={handleColorBlur('transitionColor')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-fill-color'>Transition fill color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionFillColor}
                            onChange={handleColorChange('transitionFillColor')}
                            onBlur={handleColorBlur('transitionFillColor')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-border-size'>Transition border size</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={0.1}
                            max={2}
                            value={transitionBorderSize}
                            step={0.05}
                            onChange={handleInputChange('transitionBorderSize')}
                            onMouseUp={handleMouseUp('transitionBorderSize')}
                        />
                    </div>
                    {/* checkbox, slider, slider, color picker */}
                    <div>
                        <label className='custom-configuration-label' htmlFor='indicate-arc-weight'>Indicate arc weight</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={indicateArcWeight}
                            onChange={handleInputChange('indicateArcWeight', true)}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='arc-size'>Arc size</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={0.1}
                            max={2}
                            step={0.05}
                            value={arcSize}
                            onChange={handleInputChange('arcSize')}
                            onMouseUp={handleMouseUp('arcSize')}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='arrow-head-size'>Arrow head size</label>
                        <input
                            type='range'
                            className={`custom-configuration-slider${darkMode ? ' dark' : ' light'}`}
                            min={2}
                            max={20}
                            step={1}
                            value={arrowHeadSize}
                            onChange={handleInputChange('arrowHeadSize')}
                            onMouseUp={handleMouseUp('arrowHeadSize')}
                        />
                    </div>
                    <div> {/* TODO: only show when OCPN imported and ocpn.objectTypes empty. */}
                        <label className='custom-configuration-label' htmlFor='arc-default-color'>Arc default color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={arcDefaultColor}
                            onChange={handleColorChange('arcDefaultColor')}
                            onBlur={handleColorBlur('arcDefaultColor')}
                        />
                    </div>
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="History" darkMode={darkMode} categoryIndex={3}>
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
            </ConfigurationCategory>
        </div>
    );
}

export default ConfigurationSidebar;