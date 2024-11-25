import React from 'react';
import './ConfigurationSidebar.css';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    darkMode: boolean;
}

const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({ isOpen, darkMode }) => {
    const sidebarClass = isOpen ? "sidebar open" : "sidebar";
    return (
        <div className={sidebarClass}
            style={{ 
                backgroundColor: darkMode ? '#212121' : '#2f5373',
                color: '#ffffff',
                padding: '1%' }}>
            <div><h3>Hello</h3></div>
            <div>Sources and sinks</div>
            <div>objectCentrality</div>
            <div>maxBarycenterIterations</div>
            <div>objectAttraction rangeMin rangeMax</div>
            <div>flow direction</div>
            <div>placeRadius transitionWidth (custom width) transitionHeight</div>
            <div>dummySize ??</div>
            <div>layerSep vertexSep</div>
            <div>borderPaddingX / Y ???</div>
            <div>type to color mapping</div>
            <div>default place, transition fill and stroke colors</div>
            <div>transitionBorder size, arc size, arrowHeadSize, arcDefault color</div>
        </div>
    );
}

export default ConfigurationSidebar;