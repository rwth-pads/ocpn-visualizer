import React from 'react';
import './Button.css';


const ExportButton: React.FC = () => {
    const handleButtonClick = () => {
        console.log("Exporting...");
    }

    return (
        <div>
            <button className='export-button' onClick={handleButtonClick}>Export</button>
        </div>
    );
};

export default ExportButton;