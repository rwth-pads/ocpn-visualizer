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

    function mapOCPNToLayout(ocpn: ObjectCentricPetriNet, svgRef: SVGSVGElement | null) {
        ocpn.places.forEach((place: InstanceType<typeof ObjectCentricPetriNet.Place>) => {
            d3.select(svgRef)
                .append('circle')
                .attr('cx', place.x)
                .attr('cy', place.y)
                .attr('r', 3) // TODO: user defined radius
                .style('fill', 'red'); // TODO: color based on place type
        });

        ocpn.transitions.forEach((transition: InstanceType<typeof ObjectCentricPetriNet.Transition>) => {
            d3.select(svgRef)
                .append('rect')
                .attr('x', transition.x - 2.5)
                .attr('y', transition.y - 2.5)
                .attr('width', 5) // TODO: user defined width
                .attr('height', 5) // TODO: user defined height
                .style('fill', 'blue'); // TODO: color based on transition type
        });

        ocpn.dummyNodes.forEach((dummyNode: InstanceType<typeof ObjectCentricPetriNet.Dummy>) => {
            d3.select(svgRef)
                .append('rect')
                .attr('x', dummyNode.x - 2.5) // half the width
                .attr('y', dummyNode.y - 2.5) // half the height
                .attr('width', 5) // TODO: user defined width
                .attr('height', 5) // TODO: user defined height
                .style('fill', 'green'); // TODO: color based on dummy node type
        });
    }


    useEffect(() => {
        const updateVisualization = async () => {
            if (selectedOCPN) {
                console.log('Selected OCPN:', selectedOCPN);
                // Clear the existing SVG content
                d3.select(svgRef.current).selectAll('*').remove();

                const processedOCPN = await sugiyama(selectedOCPN);

                // Map the OCPN to a layout
                mapOCPNToLayout(processedOCPN, svgRef.current);
                // Append the OCPN string representation to the SVG
                // d3.select(svgRef.current)
                //     .append('foreignObject')
                //     .attr('width', '100%')
                //     .attr('height', '100%')
                //     .append('xhtml:div')
                //     .style('font-size', '14px')
                //     .html(`<p>${processedOCPN.toString()}</p>`);
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