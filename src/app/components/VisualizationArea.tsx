import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNLayout from '../utils/classes/OCPNLayout';
import sugiyama from '../utils/sugiyama/sugiyama.js';
import './place.css';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN }) => {
    const svgRef = useRef<SVGSVGElement>(null!); // Initialize as not null
    const padding = 20; // Define padding value

    function mapOCPNToLayout(layout: OCPNLayout, svgRef: SVGSVGElement) {
        const svg = d3.select(svgRef);
        const g = svg.append('g');

        // Define arrowhead marker. TODO: change color based on object type
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', 'black');

        for (const vertexId in layout.vertices) {
            const vertex = layout.vertices[vertexId];
            if (vertex.type === OCPNLayout.PLACE_TYPE) {
                g.append('circle')
                    .attr('cx', vertex.x)
                    .attr('cy', vertex.y)
                    .attr('r', 2.5) // TODO: user defined radius
                    .attr('class', 'ocpn-place');
            } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
                g.append('rect')
                    .attr('x', vertex.x - 3.5)
                    .attr('y', vertex.y - 2.5)
                    .attr('width', 7) // TODO: user defined width
                    .attr('height', 5) // TODO: user defined height
                    .attr('class', 'ocpn-transition'); // TODO: color based on transition type
            }
        }

        for (const arcId in layout.arcs) {
            let arc = layout.arcs[arcId];
            let rev = arc.reversed;
            let sourceX = layout.vertices[arc.source].x;
            let sourceY = layout.vertices[arc.source].y;
            let targetX = layout.vertices[arc.target].x;
            let targetY = layout.vertices[arc.target].y;

            sourceY += 2.5;
            targetY -= 2.5;

            if (arc.path.length > 0) {
                let pathStart = `M ${sourceX} ${sourceY}`;
                let pathEnd = `L ${targetX} ${targetY}`;
                let pathMid = '';
                for (let i = 0; i < arc.path.length; i++) {
                    pathMid += `L ${arc.path[i].x} ${arc.path[i].y}`;
                }
                g.append('path')
                    .attr('d', pathStart + pathMid + pathEnd)
                    .attr('class', 'ocpn-arc')
                    .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
                    .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null);
            } else {
                g.append('path')
                    .attr('d', `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`)
                    .attr('class', 'ocpn-arc')
                    .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
                    .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null);
            }
        }

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
                // Temporary fix until OCPNLayout class implementation done.
                const ocpnLayout = await sugiyama(selectedOCPN, {});

                // Map the OCPN to a layout
                mapOCPNToLayout(ocpnLayout, svgRef.current!);
            }
        }
        updateVisualization();
    }, [selectedOCPN]);
    // TODO: d3 zoom and pan.
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