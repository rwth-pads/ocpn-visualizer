import React from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import MenuIcon from '@mui/icons-material/Menu';


import './Header.css';

const ITEM_HEIGHT = 48;

interface HeaderProps {
    onMenuClick: () => void;
    onImportClick: () => void;
    onExportClick: () => void;
    onToggleDarkMode: () => void;
    darkMode: boolean;
    importedObjects: ObjectCentricPetriNet[];
    selectedOCPN: number | null;
    handleSelectChange: (event: SelectChangeEvent<number | "default">) => void;
}

const Header: React.FC<HeaderProps> = ({
    onMenuClick,
    onImportClick,
    onExportClick,
    onToggleDarkMode,
    darkMode,
    importedObjects,
    selectedOCPN,
    handleSelectChange
}) => {
    return (
        <div className={`header-bar${darkMode ? ' dark' : ' light'}`}>
            <div className={`header-container${darkMode ? ' dark' : ' light'}`}>
                <div className={'header-item'}>
                    <div
                        className={`sidebar-toggle-container${darkMode ? ' dark' : ' light'}`}
                        onClick={onMenuClick}
                    >
                        <MenuIcon />
                    </div>
                </div>
                <div className={'header-item'}>
                    <div className={`header-title${darkMode ? ' dark' : ' light'}`}>
                        OCPN Visualizer
                    </div>
                </div>
                <div className={'header-item'}>
                    <div className={`header-select-container${darkMode ? ' dark' : ' light'}`}>
                        <select
                            className={`header-select${darkMode ? ' dark' : ' light'}`}
                        >

                        </select>
                    </div>
                </div>
                <div className={'header-item'}>
                    <div
                        className={`header-button${darkMode ? ' dark' : ' light'}`}
                        onClick={onImportClick}>
                        Import
                    </div>
                </div>
                <div className={'header-item'}>
                    <div
                        className={`header-button${darkMode ? ' dark' : ' light'}`}
                        onClick={onExportClick}>
                        Export
                    </div>
                </div>
                <div className={'header-item'}>
                    <div
                        className={`header-darkmode-container${darkMode ? ' dark' : ' light'}`}
                        onClick={onToggleDarkMode}>
                        <span className={`header-darkmode-icon${darkMode ? ' dark' : ' light'}`}>
                            &#128976;
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;