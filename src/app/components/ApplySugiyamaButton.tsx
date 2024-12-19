import React from 'react';
import './ApplySugiyamaButton.css';

interface ApplySugiyamaButtonProps {
    darkMode: boolean;
    menuOpen: boolean;
    onClick: () => void;
}

const ApplySugiyamaButton: React.FC<ApplySugiyamaButtonProps> = ({ darkMode, menuOpen, onClick }) => {

    return (
        <button
            className={`apply-sugiyama-button changed${darkMode ? ' dark' : ' light'}${menuOpen ? ' open' : ''}`}
            onClick={onClick}
        >⯈</button>
    );
};

export default ApplySugiyamaButton;