import React from 'react';

import './CenterButton.css';

interface CenterButtonProps {
    darkMode: boolean;
    centerVisualization: (svg: React.RefObject<SVGSVGElement>) => void;
    svg: React.RefObject<SVGSVGElement>;
}

const CenterButton: React.FC<CenterButtonProps> = ({ darkMode, centerVisualization, svg }) => {
    const mode = darkMode ? ' dark' : ' light';

    return (
        <div className={`center-button-container${mode}`}>
            <button
                className={`center-button${mode}`}
                onClick={() => centerVisualization(svg)}
                >
                    &#128967;
                </button>
        </div>
    );
};

export default CenterButton;