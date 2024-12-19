import React from 'react';
import { ChangeEvent } from 'react';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';

import './Header.css';

interface HeaderProps {
    onMenuClick: () => void;
    onImportClick: () => void;
    onExportClick: () => void;
    onToggleDarkMode: () => void;
    darkMode: boolean;
    importedObjects: ObjectCentricPetriNet[];
    selectedOCPN: number | null;
    handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
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
                <div className={'header-item item1'}>
                    <div
                        className={`sidebar-toggle-container${darkMode ? ' dark' : ' light'}`}
                        onClick={onMenuClick}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <rect y="4" width="24" height="2" fill="currentColor" />
                            <rect y="11" width="24" height="2" fill="currentColor" />
                            <rect y="18" width="24" height="2" fill="currentColor" />
                        </svg>
                    </div>
                </div>
                <div className={'header-item item2'}>
                    <div className={`header-title${darkMode ? ' dark' : ' light'}`}>
                        OCPN Visualizer
                    </div>
                </div>
                <div className={'header-item item3'}>
                    <div className={`header-select-container${darkMode ? ' dark' : ' light'}`}>
                        <select
                            className={`header-select${darkMode ? ' dark' : ' light'}`}
                            onChange={handleSelectChange}
                            value={selectedOCPN !== null ? selectedOCPN : 'default'}
                        >
                            {importedObjects.length === 0 && (
                                <option value="default" disabled>
                                    Import an OCPN
                                </option>
                            )}
                            {importedObjects.map((obj, index) => (
                                <option
                                    key={index}
                                    value={index}
                                >
                                    {obj.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={'header-item item4'}>
                    <div
                        className={`header-button${darkMode ? ' dark' : ' light'}`}
                        onClick={onImportClick}>
                        Import
                    </div>
                </div>
                <div className={'header-item item5'}>
                    <div
                        className={`header-button${darkMode ? ' dark' : ' light'}`}
                        onClick={onExportClick}>
                        Export
                    </div>
                </div>
                <div className={'header-item item6'}>
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