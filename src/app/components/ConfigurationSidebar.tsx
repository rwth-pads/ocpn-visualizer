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

    const [objectAttraction, setObjectAttraction] = useState(userConfig.objectAttraction ?? 0.1);
    const [flowDirection, setFlowDirection] = useState(userConfig.direction ?? 'TB');

    const handleObjectAttractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setObjectAttraction(value);
        setUserConfig(value, 'objectAttraction');
    };

    const handleFlowDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFlowDirection(value);
        setUserConfig(value, 'direction');
    };

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
                            {/* List of names and corresponding color pickers */}
                            <div>type to color mapping</div>
                        </>
                    ) : (
                        <div style={{ padding: '3%'}}>
                            <div>
                                These configuration options will be available once you import an OCPN.
                            </div>
                        </div>
                    )}
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Sugiyama Configurations" darkMode={darkMode} categoryIndex={1}>
                <div style={{ paddingLeft: '4%' }}>
                    {/* select */}
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
                    <div>objectCentrality</div>
                    {/* 1 Slider, 2 Num inputs */}
                    <div>objectAttraction rangeMin rangeMax</div>
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
                    {/* 1 num input */}
                    <div>maxBarycenterIterations</div>
                    {/* checkbox */}
                    <div>combine two-cycle arcs</div>
                </div>
            </ConfigurationCategory>
            <ConfigurationCategory title="Styling Configurations" darkMode={darkMode} categoryIndex={2}>
                <div style={{ paddingLeft: '4%' }}>
                    {/* slider for each */}
                    <div>placeRadiustransitionWidth (custom width) transitionHeight</div>
                    <div>dummySize ??</div>
                    <div>layerSep vertexSep</div>
                    {/* 3 color pickers */}
                    <div>default place, transition fill and stroke colors</div>
                    {/* slider */}
                    <div>transitionBorder size</div>
                    {/* checkbox, slider, slider, color picker */}
                    <div>indicate arc weight, arc size, arrowHeadSize, arcDefault color</div>
                </div>
            </ConfigurationCategory>
        </div>
    );
}

export default ConfigurationSidebar;