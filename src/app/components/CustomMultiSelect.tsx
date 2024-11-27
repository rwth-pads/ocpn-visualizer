import React, { useState, useEffect } from 'react';
import './multiSelect.css';

const defaultOptions = [
    'Item',
    'Order',
    'Customer',
    'Product'
];

interface CustomMultiSelectProps {
    darkMode: boolean;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ darkMode }) => {
    const mode = darkMode ? ' dark' : ' light';

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionToggle = (option: string) => {
        setSelectedOptions((prevSelected) =>
            prevSelected.includes(option)
                ? prevSelected.filter((item) => item !== option)
                : [...prevSelected, option]
        );
    };

    const handleSelectAllToggle = () => {
        if (selectedOptions.length === defaultOptions.length) {
            setSelectedOptions([]);
        } else {
            setSelectedOptions(defaultOptions);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const filteredOptions = defaultOptions.filter((option) =>
        option.toLowerCase().includes(searchTerm)
    );

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
                        {selectedOptions.length === 0 ? (
                            <span className={`placeholder${mode}`}>Select object types</span>
                        ) : (
                            <>
                                {selectedOptions.slice(0, 2).map((option, index) => (
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
                                {selectedOptions.length > 2 && (
                                    <span className={`custom-tag${mode}`}>+{selectedOptions.length - 2} more</span>
                                )}
                            </>
                        )}
                    </div>
                    <div className={`custom-select-arrow-box${mode}`}>
                        <span className={`custom-select-arrow${mode}`}>&gt;</span>
                    </div>
                </div>
                {isOpen && (
                    <div className={`custom-select-options${mode}`}>
                        <div className={`custom-option-search-tags${mode}`}>
                            <input
                                type="text"
                                className={`custom-search-tags${mode}`}
                                placeholder="Search object types..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button type="button" className={`custom-clear-search-tags${mode}`} onClick={handleClearSearch}>
                                <i className={`fa fa-close${mode}`}></i>
                            </button>
                        </div>
                        <div
                            className={`custom-option all-tags${mode} ${selectedOptions.length === defaultOptions.length ? 'active' : ''}`}
                            onClick={handleSelectAllToggle}
                        >
                            Select all
                        </div>
                        {filteredOptions.length === 0 ? (
                            <div className={`custom-select-no-result-message${mode}`}>No matching object types</div>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`custom-option${mode} ${selectedOptions.includes(option) ? 'active' : ''}`}
                                    onClick={() => handleOptionToggle(option)}
                                >
                                    {option}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomMultiSelect;