import React, { useState, useEffect, useRef, use } from 'react';
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
    sugiyamaAppliedSwitch: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
}

const LegendComponent: React.FC<LegendComponentProps> = ({ darkMode, userConfig, ocpn, legendOpen, setLegendOpen, sugiyamaAppliedSwitch, svgRef }) => {
    const legendRef = useRef<HTMLDivElement>(null);
    const shown = ocpn !== null ? '' : ' hidden';

    const [selectedObjectTypes, setSelectedObjectTypes] = useState(userConfig.includedObjectTypes);
    const [activeObjectTypes, setActiveObjectTypes] = useState(new Set(userConfig.includedObjectTypes));
    const [allSelected, setAllSelected] = useState(true);

    useEffect(() => {
        setAllSelected(true);
        setSelectedObjectTypes(userConfig.includedObjectTypes);
        setActiveObjectTypes(new Set(userConfig.includedObjectTypes));
    }, [userConfig.includedObjectTypes, sugiyamaAppliedSwitch]);
    
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

    useEffect(() => {
        const svg = select(svgRef.current);
        svg.selectAll('.ocpnarc, .ocpnplace, .ocpntransition').style('opacity', 0.2);
        activeObjectTypes.forEach(objectType => {
            const ot = objectType.replace(' ', '');
            svg.selectAll(`.${ot}`).style('opacity', 1);
            svg.selectAll('.ocpntransition')
                .filter(function () {
                    const adjacentObjectTypes = select(this).attr('adjacentObjectTypes');
                    return adjacentObjectTypes ? adjacentObjectTypes.split(' ').includes(objectType) : false;
                })
                .style('opacity', 1);
        });
    }, [activeObjectTypes]);

    const handleLegendItemClick = (objectType: string) => {
        const newActiveObjectTypes = new Set(activeObjectTypes);
        if (newActiveObjectTypes.has(objectType)) {
            newActiveObjectTypes.delete(objectType);
        } else {
            newActiveObjectTypes.add(objectType);
        }
        setActiveObjectTypes(newActiveObjectTypes);
    };


    const toggleAll = () => {
        if (allSelected) {
            setActiveObjectTypes(new Set());
        } else {
            setActiveObjectTypes(new Set(selectedObjectTypes));
        }

        setAllSelected(!allSelected);
    }

    return (
        <div
            ref={legendRef}
            onClick={() => {
                if (!legendOpen) {
                    setLegendOpen(true)
                }
            }}
            className={`legend-container${darkMode ? ' dark' : ' light'}${shown}${legendOpen ? ' open' : ''}`}>
            {legendOpen ? (
                <div className="legend-content">
                    <div
                        onClick={toggleAll}
                        className={`legend-title${darkMode ? ' dark' : ' light'}`}>
                        Toggle all object types
                    </div>
                    {selectedObjectTypes.map((objectType: string) => (
                        <div
                            key={objectType}
                            className={`legend-item${darkMode ? ' dark' : ' light'}${activeObjectTypes.has(objectType) ? ' active' : ''}`}
                            onClick={() => handleLegendItemClick(objectType)}
                            style={{ color: userConfig.typeColorMapping.get(objectType) }}
                        >
                            {objectType}
                        </div>
                    ))}
                    <hr />
                    <div
                        className={`legend-item${darkMode ? ' dark' : ' light'}`}
                        onClick={() => console.log('TODO: Implement this')}
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