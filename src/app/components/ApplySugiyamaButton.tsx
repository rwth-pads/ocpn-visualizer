import React, { useState, useEffect } from 'react';
import OCPNConfig from '../utils/classes/OCPNConfig';
import './ApplySugiyamaButton.css';

interface ApplySugiyamaButtonProps {
    darkMode: boolean;
    menuOpen: boolean;
    userConfig: OCPNConfig;
    changed: boolean;
    onClick: () => void;
}

const ApplySugiyamaButton: React.FC<ApplySugiyamaButtonProps> = ({ darkMode, menuOpen, userConfig, changed, onClick }) => {

    return (
        <button // Todo make this a component and use useEffect on userConfig to set visibility.
            className={`apply-sugiyama-button${darkMode ? ' dark' : ' light'}${menuOpen ? ' open' : ''}${changed ? ' changed' : ''}`}
            onClick={onClick}
        >⯈</button>
    );
};

export default ApplySugiyamaButton;