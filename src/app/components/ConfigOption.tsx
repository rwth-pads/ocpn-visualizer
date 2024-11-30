import React from 'react';
import './ConfigOption.css';


interface ConfigOptionProps {
    label: string;
    darkMode: boolean;
    children: React.ReactNode;
}

const ConfigOption: React.FC<ConfigOptionProps> = ({ label, darkMode, children }) => {
    const mode = darkMode ? ' dark' : ' light';
    const optionClass = `config-option-container${mode}`;

    return (
        <div className={optionClass}>
            <div className={`config-option-label${mode}`}>
                {label}
            </div>
            <div className={`config-option-content${mode}`}>
                {children}
            </div>
        </div>
    );
}

export default ConfigOption;