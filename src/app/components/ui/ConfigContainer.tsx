import React from 'react';

interface ConfigContainerProps {
    name: string;
    svg: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onClick?: () => void;
}

const ConfigContainer: React.FC<ConfigContainerProps> = ({ name, svg, isOpen, onClick, children }) => { 
    return (
        <div className={`config-container ${isOpen ? 'open' : ''}`}>
            <div className="config-info" onClick={onClick}>
                <div className="config-svg">
                    {svg}
                </div>
                <div className="config-name">
                    <h1>{name}</h1>
                </div>
            </div>
            <div className={`config-collapsible-container ${isOpen ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default ConfigContainer;