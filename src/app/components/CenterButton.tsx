import React from 'react';

import './CenterButton.css';

interface CenterButtonProps {
    darkMode: boolean;
    centerVisualization: () => void;
}

const CenterButton: React.FC<CenterButtonProps> = ({ darkMode, centerVisualization }) => {
    const mode = darkMode ? ' dark' : ' light';

    return (
        <div className={`center-button-container${mode}`}>
            <button
                className={`center-button${mode}`}
                onClick={centerVisualization}
                >
                    &#128967;
                </button>
        </div>
    );
};

export default CenterButton;