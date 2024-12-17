import React, { useState, useEffect } from 'react';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import './multiSelect.css';

interface CustomMultiSelectProps {
    darkMode: boolean;
    currentOCPN: ObjectCentricPetriNet;
    userConfig: OCPNConfig;
    setChange: (change: boolean) => void;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ darkMode, currentOCPN, userConfig, setChange }) => {
    const mode = darkMode ? ' dark' : ' light';
    const VISIBLEOBJECTTYPES = 2;
    const MIN_FOR_SEARCH = 2;
    const searchNeeded = currentOCPN.objectTypes.length > MIN_FOR_SEARCH;

    const [selectedObjectTypes, setObjectTypes] = useState(userConfig.includedObjectTypes);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        userConfig.includedObjectTypes = selectedObjectTypes;
        // Check if sources and sinks need to be updated.
        userConfig.sources = userConfig.sources.filter(source => {
            // Get the object type of the source.
            const sourceObjectType = currentOCPN.places.find(place => place.id === source)?.objectType;
            return selectedObjectTypes.includes(sourceObjectType);
        });
        userConfig.sinks = userConfig.sinks.filter(sink => {
            // Get the object type of the sink.
            const sinkObjectType = currentOCPN.places.find(place => place.id === sink)?.objectType;
            return selectedObjectTypes.includes(sinkObjectType);
        });
        setChange(true);
        // console.log('Included object types: ', userConfig.includedObjectTypes);
    }, [selectedObjectTypes]);

    const handleOptionToggle = (option: string) => {
        setObjectTypes((prevSelected) =>
            prevSelected.includes(option)
                ? prevSelected.filter((item) => item !== option)
                : [...prevSelected, option]
        );
    };

    const handleSelectAllToggle = () => {
        if (selectedObjectTypes.length === currentOCPN?.objectTypes.length) {
            setObjectTypes([]);
        } else {
            setObjectTypes(currentOCPN?.objectTypes ?? []);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const filteredOptions = (currentOCPN?.objectTypes ?? []).filter((option: string) =>
        option.toLowerCase().includes(searchTerm)
    );

    useEffect(() => {
        setObjectTypes(currentOCPN?.objectTypes ?? []);
    }, [currentOCPN]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.custom-multiple-select')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className={`custom-multiselect-container${mode}`}>
            <div className={`custom-multiple-select ${isOpen ? 'open' : ''}${mode}`}>
                <div className={`custom-select-box${mode}`} onClick={() => setIsOpen(!isOpen)}>
                    <input type="text" className={`custom-select-tags-input${mode}`} name="tags" hidden />
                    <div className={`custom-selected-options${mode}`}>
                        {selectedObjectTypes.length === 0 ? (
                            <span className={`placeholder${mode}`}>Select object types</span>
                        ) : (
                            <>
                                {selectedObjectTypes.slice(0, VISIBLEOBJECTTYPES).map((option, index) => (
                                    <span key={index} className={`custom-tag${mode}`}>
                                        {option}
                                        <span
                                            className={`custom-remove-tag${mode}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptionToggle(option);
                                            }}
                                        >
                                            &times;
                                        </span>
                                    </span>
                                ))}
                                {selectedObjectTypes.length > VISIBLEOBJECTTYPES && (
                                    <span className={`custom-tag${mode}`}>+{selectedObjectTypes.length - VISIBLEOBJECTTYPES} more</span>
                                )}
                            </>
                        )}
                    </div>
                    <div className={`custom-select-arrow-box${mode}`}>
                        <span className={`custom-select-arrow${mode}`}>{isOpen ? '⯅' : '⯆'}</span>
                    </div>
                </div>
                {isOpen && (
                    <div className={`custom-select-options${mode}`}>
                        {searchNeeded && (
                            <div className={`custom-option-search-tags${mode}`}>
                                <input
                                    type="text"
                                    className={`custom-search-tags${mode}`}
                                    placeholder="Search object types..."
                                    value={searchTerm}
                                    spellCheck={false}
                                    onChange={handleSearchChange}
                                />
                                <button type="button" className={`custom-clear-search-tags${mode}`} onClick={handleClearSearch}>
                                    <span className={`custom-clear-search-tags-cross${mode}`}>&times;</span>
                                </button>
                            </div>
                        )}
                        <div
                            className={`custom-option all-tags${mode} ${selectedObjectTypes.length === currentOCPN.objectTypes.length ? 'active' : ''}`}
                            onClick={handleSelectAllToggle}
                        >
                            Select all
                        </div>
                        {filteredOptions.length === 0 ? (
                            <div className={`custom-select-no-result-message${mode}`}>No matching object types</div>
                        ) : (
                            filteredOptions.map((option: string, index: number) => (
                                <div
                                    key={index}
                                    className={`custom-option${mode} ${selectedObjectTypes.includes(option) ? 'active' : ''}`}
                                    onClick={() => handleOptionToggle(option)}
                                    style={{ color: userConfig.typeColorMapping.get(option)}}
                                >
                                    <input
                                        type="checkbox"
                                        className={`custom-option-checkbox${mode}`}
                                        checked={selectedObjectTypes.includes(option)}
                                        onChange={() => { }} />
                                    <span className={`custom-checkbox-span${mode}`}>
                                        <span className={`custom-checkbox-tick${mode}`}>
                                            {selectedObjectTypes.includes(option) ? '✔' : ''}
                                        </span>
                                    </span>
                                    {option}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default CustomMultiSelect;