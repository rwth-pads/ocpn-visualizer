import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import sugiyama from '../utils/sugiyama/sugiyama.js';
import './place.css';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN }) => {
    const svgRef = useRef<SVGSVGElement>(null!); // Initialize as not null
    const padding = 20; // Define padding value

    function mapOCPNToLayout(ocpn: ObjectCentricPetriNet, svgRef: SVGSVGElement) {
        const svg = d3.select(svgRef);
        const g = svg.append('g');

        ocpn.places.forEach((place: InstanceType<typeof ObjectCentricPetriNet.Place>) => {
            g.append('circle')
                .attr('cx', place.x)
                .attr('cy', place.y)
                .attr('r', 2.5) // TODO: user defined radius
                .attr('class', 'ocpn-place');
        });

        ocpn.transitions.forEach((transition: InstanceType<typeof ObjectCentricPetriNet.Transition>) => {
            g.append('rect')
                .attr('x', transition.x - 3.5)
                .attr('y', transition.y - 2.5)
                .attr('width', 7) // TODO: user defined width
                .attr('height', 5) // TODO: user defined height
                .attr('class', 'ocpn-transition'); // TODO: color based on transition type
        });

        ocpn.dummyNodes.forEach((dummyNode: InstanceType<typeof ObjectCentricPetriNet.Dummy>) => {
            g.append('rect')
                .attr('x', dummyNode.x - 2.5) // half the width
                .attr('y', dummyNode.y - 2.5) // half the height
                .attr('width', 5) // TODO: user defined width
                .attr('height', 5) // TODO: user defined height
                .style('fill', 'green'); // TODO: color based on dummy node type
        });

        ocpn.arcs.forEach((arc: InstanceType<typeof ObjectCentricPetriNet.Arc>) => {
            const dir = arc.reversed ? -1 : 1;
            var targetX = dir == -1 ? arc.source.x : arc.target.x;
            var sourceX = dir == -1 ? arc.target.x : arc.source.x;
            var sourceY = arc.source.y + dir * 2.5;
            var targetY = arc.target.y - dir * 2.5;
            if (dir == -1) {
                const temp = sourceY;
                sourceY = targetY;
                targetY = temp;
            }
            g.append('line')
                .attr('x1', sourceX)
                .attr('y1', sourceY)
                .attr('x2', targetX)
                .attr('y2', targetY)
                .attr('class', 'ocpn-arc');
        });

        // Calculate the bounding box of the layout
        const node = g.node();
        if (!node) return;
        const bbox = node.getBBox();
        const width = svgRef.clientWidth;
        const height = svgRef.clientHeight;

        // Calculate scaling and translation to fit and center the layout with padding
        const scale = Math.min((width - 2 * padding) / bbox.width, (height - 2 * padding) / bbox.height);
        const translateX = (width - bbox.width * scale) / 2 - bbox.x * scale + padding;
        // const translateX = padding - bbox.x * scale;
        const translateY = (height - bbox.height * scale) / 2 - bbox.y * scale + padding;

        // Apply transformations
        g.attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    }

    useEffect(() => {
        const updateVisualization = async () => {
            if (selectedOCPN) {
                // Clear the existing SVG content
                d3.select(svgRef.current!).selectAll('*').remove();
                
                const processedOCPN = await sugiyama(selectedOCPN);
                
                // Map the OCPN to a layout
                mapOCPNToLayout(processedOCPN, svgRef.current!);
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
                padding: 2,
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