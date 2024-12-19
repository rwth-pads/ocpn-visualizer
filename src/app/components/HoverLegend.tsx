import React from 'react';

import './HoverLegend.css';

interface HoverLegendProps {
    darkMode: boolean;
    currentHover: string;
}

const HoverLegend: React.FC<HoverLegendProps> = ({ darkMode, currentHover }) => {
    const show = currentHover.length > 0;

    return (
        <div className={`hover-legend-container${darkMode ? ' dark' : ' light'}${show ? ' show' : ''}`}>
            {currentHover}
        </div>
    );
};

export default HoverLegend;