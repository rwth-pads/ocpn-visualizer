import React, { useState, useEffect, useRef } from 'react';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import { select } from 'd3-selection';

import './LegendComponent.css';

interface LegendComponentProps {
    darkMode: boolean;
    userConfig: OCPNConfig;
    ocpn: ObjectCentricPetriNet | null;
    legendOpen: boolean;
    setLegendOpen: (open: boolean) => void;
    svgRef: React.RefObject<SVGSVGElement>;
}

const LegendComponent: React.FC<LegendComponentProps> = ({ darkMode, userConfig, ocpn, legendOpen, setLegendOpen, svgRef }) => {
    const legendRef = useRef<HTMLDivElement>(null);
    const shown = ocpn !== null ? '' : ' hidden';

    const [selectedObjectTypes, setSelectedObjectTypes] = useState(userConfig.includedObjectTypes);

    useEffect(() => {
        setSelectedObjectTypes(userConfig.includedObjectTypes);
    }, [userConfig.includedObjectTypes]);

    const handleClickOutside = (event: MouseEvent) => {
        if (legendRef.current && !legendRef.current.contains(event.target as Node)) {
            setLegendOpen(false);
        }
    };

    useEffect(() => {
        if (legendOpen) {
            document.addEventListener('mousedown', handleClickOutside, true);
        } else {
            document.removeEventListener('mousedown', handleClickOutside, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, [legendOpen]);

    const handleObjectTypeMouseEnter = (objectType: string) => {
        const svg = select(svgRef.current);
        var ot = objectType ? objectType.replace(' ', '') : '';
        svg.selectAll('.ocpnarc, .ocpnplace, .ocpntransition').style('opacity', 0.1);
        svg.selectAll(`.${ot}`).style('opacity', 1);
        // Highlight all transitions where the ot is in their attribute: adjacentObjectTypes.
        svg.selectAll('.ocpntransition')
            .filter(function () {
                const adjacentObjectTypes = select(this).attr('adjacentObjectTypes');
                return adjacentObjectTypes ? adjacentObjectTypes.split(' ').includes(objectType) : false;
            })
            .style('opacity', 1);
    }

    const handleObjectTypeMouseLeave = (objectType: string) => {
        // Reset the opacity of all places and transitions to 1.
        const svg = select(svgRef.current);
        svg.selectAll('*').style('opacity', 1);
    }

    const handleVariableArcsMouseEnter = () => {
        // Highlight variable arcs by setting red stroke.
        const svg = select(svgRef.current);
        svg.selectAll('.ocpnarc.variable.inner')
            .attr('stroke', 'red');
    }

    const handleVariableArcsMouseLeave = () => {
        // Reset style of all variable arcs.
        const svg = select(svgRef.current);
        svg.selectAll('.ocpnarc.variable.inner')
            .attr('stroke', userConfig.svgBackgroundColor);
    }

    return (
        <div
            ref={legendRef}
            onClick={() => { setLegendOpen(true); console.log(selectedObjectTypes); }}
            className={`legend-container${darkMode ? ' dark' : ' light'}${shown}${legendOpen ? ' open' : ''}`}>
            {legendOpen ? (
                <div className="legend-content">
                    <div className={`legend-title${darkMode ? ' dark' : ' light'}`}>
                        Object Types
                    </div>
                    {selectedObjectTypes.map((objectType: string) => (
                        <div
                            key={objectType}
                            className={`legend-item${darkMode ? ' dark' : ' light'}`}
                            onMouseEnter={() => handleObjectTypeMouseEnter(objectType)}
                            onMouseLeave={() => handleObjectTypeMouseLeave(objectType)}
                            style={{ color: userConfig.typeColorMapping.get(objectType) }}
                        >
                            {objectType}
                        </div>
                    ))}
                    <hr />
                    <div
                        className={`legend-item${darkMode ? ' dark' : ' light'}`}
                        onMouseEnter={handleVariableArcsMouseEnter}
                        onMouseLeave={handleVariableArcsMouseLeave}
                    >
                        Variable arcs
                    </div>
                </div>
            ) : (
                <span className={`legend-toggle-icon${darkMode ? ' dark' : ' light'}`}>
                    !
                </span>
            )}
        </div>
    );
};

export default LegendComponent;