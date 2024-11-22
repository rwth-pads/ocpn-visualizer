import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import sugiyama from '../utils/sugiyama/sugiyama.js';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const updateVisualization = async () => {
            if (selectedOCPN) {
                // Create a deep copy of the selectedOCPN
                const copiedOCPN = selectedOCPN.deepCopy();
                // Clear the existing SVG content
                d3.select(svgRef.current).selectAll('*').remove();

                const processedOCPN = await sugiyama(copiedOCPN);
                // Append the OCPN string representation to the SVG
                d3.select(svgRef.current)
                    .append('foreignObject')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .append('xhtml:div')
                    .style('font-size', '14px')
                    .html(`<p>${processedOCPN.toString()}</p>`);
            }
        }
        updateVisualization();
    }, [selectedOCPN]);

    return (
        <Box
            sx={{
                border: '2px dotted',
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </Box>
    );
};

export default VisualizationArea;