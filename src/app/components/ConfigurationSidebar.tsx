import React, { useState } from 'react';
import ConfigurationCategory from './ConfigurationCategory';
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

    interface SetUserConfig {
        <K extends keyof OCPNConfig>(value: OCPNConfig[K], attribute: K): void;
    }

    const setUserConfig: SetUserConfig = (value, attribute) => {
        userConfig[attribute] = value;
    }

    const [configLog, setConfigLog] = useState([{ config: { ...userConfig }, description: 'Initial configuration' }]);

    const addLogEntry = (attribute: keyof OCPNConfig) => {
        const description = `Changed ${attribute} to ${userConfig[attribute]}`;
        setConfigLog([...configLog, { config: { ...userConfig }, description }]);
    }

    const restoreConfig = (config: OCPNConfig) => {
        Object.keys(config).forEach((key) => {
            setUserConfig(config[key as keyof OCPNConfig], key as keyof OCPNConfig);
        });
    }

    const [flowDirection, setFlowDirection] = useState(userConfig.direction ?? 'TB');
    const handleFlowDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFlowDirection(value);
        setUserConfig(value, 'direction');
    };

    const [objectAttraction, setObjectAttraction] = useState(userConfig.objectAttraction ?? 0.1);
    const handleObjectAttractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setObjectAttraction(value);
        setUserConfig(value, 'objectAttraction');
    };

    const [objectAttractionRangeMin, setObjectAttractionRangeMin] = useState(userConfig.objectAttractionRangeMin ?? 1);
    const handleObjectAttractionRangeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setObjectAttractionRangeMin(value);
        setUserConfig(value, 'objectAttractionRangeMin');
    };

    const [objectAttractionRangeMax, setObjectAttractionRangeMax] = useState(userConfig.objectAttractionRangeMax ?? 2);
    const handleObjectAttractionRangeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setObjectAttractionRangeMax(value);
        setUserConfig(value, 'objectAttractionRangeMax');
    };

    const [maxBarycenterIterations, setMaxBarycenterIterations] = useState(userConfig.maxBarycenterIterations ?? 4);
    const handleMaxBarycenterIterationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setMaxBarycenterIterations(value);
        setUserConfig(value, 'maxBarycenterIterations');
    };

    const [combineArcs, setCombineArcs] = useState(userConfig.combineArcs ?? false);
    const handleCombineArcsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        setCombineArcs(value);
        setUserConfig(value, 'combineArcs');
    }

    const [placeRadius, setPlaceRadius] = useState(userConfig.placeRadius ?? 5);
    const handlePlaceRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setPlaceRadius(value);
        setUserConfig(value, 'placeRadius');
    }

    const [transitionCustomWidth, setTransitionCustomWidth] = useState(userConfig.transitionCustomWidth ?? false);
    const handleTransitionCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        setTransitionCustomWidth(value);
        setUserConfig(value, 'transitionCustomWidth');
    }

    const [transitionWidth, setTransitionWidth] = useState(userConfig.transitionWidth ?? 20);
    const handleTransitionWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setTransitionWidth(value);
        setUserConfig(value, 'transitionWidth');
    }

    const [transitionHeight, setTransitionHeight] = useState(userConfig.transitionHeight ?? 10);
    const handleTransitionHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setTransitionHeight(value);
        setUserConfig(value, 'transitionHeight');
    }

    const [dummySize, setDummySize] = useState(userConfig.dummySize ?? 5);
    const handleDummySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setDummySize(value);
        setUserConfig(value, 'dummySize');
    }

    const [layerSep, setLayerSep] = useState(userConfig.layerSep ?? 10);
    const handleLayerSepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setLayerSep(value);
        setUserConfig(value, 'layerSep');
    }

    const [vertexSep, setVertexSep] = useState(userConfig.vertexSep ?? 10);
    const handleVertexSepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setVertexSep(value);
        setUserConfig(value, 'vertexSep');
    }

    const [defaultPlaceColor, setDefaultPlaceColor] = useState(userConfig.defaultPlaceColor ?? '#000000');
    const handleDefaultPlaceColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDefaultPlaceColor(value);
        setUserConfig(value, 'defaultPlaceColor');
    }

    const [transitionColor, setTransitionColor] = useState(userConfig.transitionColor ?? '#000000');
    const handleTransitionColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTransitionColor(value);
        setUserConfig(value, 'transitionColor');
    }

    const [transitionFillColor, setTransitionFillColor] = useState(userConfig.transitionFillColor ?? '#ffffff');
    const handleTransitionFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTransitionFillColor(value);
        setUserConfig(value, 'transitionFillColor');
    }

    const [transitionBorderSize, setTransitionBorderSize] = useState(userConfig.transitionBorderSize ?? 1);
    const handleTransitionBorderSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setTransitionBorderSize(value);
        setUserConfig(value, 'transitionBorderSize');
    }

    const [indicateArcWeight, setIndicateArcWeight] = useState(userConfig.indicateArcWeight ?? false);
    const handleIndicateArcWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        setIndicateArcWeight(value);
        setUserConfig(value, 'indicateArcWeight');
    }

    const [arcSize, setArcSize] = useState(userConfig.arcSize ?? 1);
    const handleArcSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setArcSize(value);
        setUserConfig(value, 'arcSize');
    }

    const [arrowHeadSize, setArrowHeadSize] = useState(userConfig.arrowHeadSize ?? 5);
    const handleArrowHeadSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setArrowHeadSize(value);
        setUserConfig(value, 'arrowHeadSize');
    }

    const [arcDefaultColor, setArcDefaultColor] = useState(userConfig.arcDefaultColor ?? '#000000');
    const handleArcDefaultColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setArcDefaultColor(value);
        setUserConfig(value, 'arcDefaultColor');
    }

    return (
        <div className={sidebarClass}>
            <ConfigurationCategory title="Object Configurations" darkMode={darkMode} categoryIndex={0}>
                <div style={{ paddingLeft: '4%' }}>
                    {(currentOCPN !== null) ? (
                        <>
                            {/* multi select */}
                            <div>Included object types</div>
                            {/* one select for object types + transition, one select which vertex -> highlict hovered vertex */}
                            <div>Sources and sinks</div>
                            <div>Indicate sources, sinks with custom styling</div>
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
                            onChange={handleFlowDirectionChange}
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
                            onChange={handleObjectAttractionChange}
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
                            onChange={handleObjectAttractionRangeMinChange}
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
                            onChange={handleObjectAttractionRangeMaxChange}
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
                            onChange={handleMaxBarycenterIterationsChange}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='combine-arcs'>Combine Long Arcs</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={combineArcs}
                            onChange={handleCombineArcsChange}
                        />
                    </div>
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Styling Configurations" darkMode={darkMode} categoryIndex={2}>
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
                            onChange={handlePlaceRadiusChange}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-custom-width'>Use custom transition width</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={transitionCustomWidth}
                            onChange={handleTransitionCustomWidthChange}
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
                            onChange={handleTransitionWidthChange}
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
                            onChange={handleTransitionHeightChange}
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
                            onChange={handleDummySizeChange}
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
                            onChange={handleLayerSepChange}
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
                            onChange={handleVertexSepChange}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='default-place-color'>Default place color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={defaultPlaceColor}
                            onChange={handleDefaultPlaceColorChange}
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
                            onChange={handleTransitionColorChange}
                        />
                    </div>
                    <div>
                        <label className='custom-configuration-label' htmlFor='transition-fill-color'>Transition fill color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={transitionFillColor}
                            onChange={handleTransitionFillColorChange}
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
                            onChange={handleTransitionBorderSizeChange}
                        />
                    </div>
                    {/* checkbox, slider, slider, color picker */}
                    <div>
                        <label className='custom-configuration-label' htmlFor='indicate-arc-weight'>Indicate arc weight</label>
                        <input
                            type='checkbox'
                            className={`custom-configuration-checkbox${darkMode ? ' dark' : ' light'}`}
                            checked={indicateArcWeight}
                            onChange={handleIndicateArcWeightChange}
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
                            onChange={handleArcSizeChange}
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
                            onChange={handleArrowHeadSizeChange}
                        />
                    </div>
                    <div> {/* TODO: only show when OCPN imported and ocpn.objectTypes empty. */}
                        <label className='custom-configuration-label' htmlFor='arc-default-color'>Arc default color</label>
                        <input
                            type='color'
                            className={`custom-configuration-color-picker${darkMode ? ' dark' : ' light'}`}
                            value={arcDefaultColor}
                            onChange={handleArcDefaultColorChange}
                        />
                    </div>
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Configuration Log" darkMode={darkMode} categoryIndex={3}>
                <div style={{ paddingLeft: '4%' }}>
                    <div>
                        <p>Configuration Log</p>
                        <p>Log of all configuration changes made during the session.</p>
                        {configLog.map((logEntry, index) => (
                            <div key={index}>
                                <p>{logEntry.description}</p>
                                <button onClick={() => restoreConfig(logEntry.config)}>Restore</button>
                            </div>
                        ))}
                    </div>
                </div>
            </ConfigurationCategory>
        </div>
    );
}

export default ConfigurationSidebar;