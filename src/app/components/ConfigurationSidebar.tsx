import React from 'react';
import ConfigurationCategory from './ConfigurationCategory';'./ConfigurationCategory';
import './ConfigurationSidebar.css';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    darkMode: boolean;
}

const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({ isOpen, darkMode }) => {
    const mode = darkMode ? 'dark' : 'light';
    const sidebarClass = isOpen ? "sidebar open " + mode : "sidebar " + mode;
    return (
        <div className={sidebarClass}>
            <ConfigurationCategory title="Object Configurations" darkMode={darkMode} categoryIndex={0} />
            <ConfigurationCategory title="Sugiyama Configurations" darkMode={darkMode} categoryIndex={1} />
            <ConfigurationCategory title="Styling Configurations" darkMode={darkMode} categoryIndex={2} />

            
            {/* <div>Object Configurations</div>
            <div style={{ paddingLeft: '4%' }}>
                <div>Included object types</div>
                <div>Sources and sinks</div>
                <div>type to color mapping</div>
            </div>

            <hr style={{margin: '2% 0%'}} />

            <div>Sugiyama Configurations</div>
            <div style={{ paddingLeft: '4%' }}>
                <div>flow direction</div>
                <div>objectCentrality</div>
                <div>objectAttraction rangeMin rangeMax</div>
                <div>maxBarycenterIterations</div>
            </div>

            <hr style={{margin: '2% 0%'}} />
            
            <div>Styling</div>
            <div style={{ paddingLeft: '4%' }}>
                <div>placeRadius transitionWidth (custom width) transitionHeight</div>
                <div>dummySize ??</div>
                <div>layerSep vertexSep</div>
                <div>borderPaddingX / Y ???</div>
                <div>default place, transition fill and stroke colors</div>
                <div>transitionBorder size, arc size, arrowHeadSize, arcDefault color</div>
            </div> */}
        </div>
    );
}

export default ConfigurationSidebar;