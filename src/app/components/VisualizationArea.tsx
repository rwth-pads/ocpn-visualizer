import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNLayout from '../utils/classes/OCPNLayout';
import sugiyama from '../utils/sugiyama/sugiyama.js';
import './place.css';
import { dark } from '@mui/material/styles/createPalette';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    darkMode: boolean;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, darkMode }) => {
    const svgRef = useRef<SVGSVGElement>(null!); // Initialize as not null
    const padding = 20; // Define padding value
    const previousOCPNRef = useRef<ObjectCentricPetriNet | null>(null);

    function mapOCPNToLayout(layout: OCPNLayout, svgRef: SVGSVGElement) {
        // Create objectType -> color mapping
        const objectTypeColorMap: Map<string, string> = new Map();
        let colorIndex = 0;
        for (const objectType of layout.objectTypes) {
            objectTypeColorMap.set(objectType, COLORS_ARRAY[colorIndex]);
            colorIndex = (colorIndex + 1) % COLORS_ARRAY.length;
        }

        const svg = d3.select(svgRef);
        const g = svg.append('g');

        // Define arrowhead marker. TODO: change color based on object type
        // TODO: arrow should not go into the place or transition.
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 10)
            .attr('refY', 5)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('class', 'marker-arrow-fill');

        for (const arcId in layout.arcs) {
            let arc = layout.arcs[arcId];
            let sourceX = layout.vertices[arc.source].x;
            let sourceY = layout.vertices[arc.source].y;
            let targetX = layout.vertices[arc.target].x;
            let targetY = layout.vertices[arc.target].y;
            let ot = arc.objectType;
            let color = objectTypeColorMap.get(ot) || 'black';
            sourceY += 2.5;
            targetY -= 2.5;

            if (arc.path.length > 0) {
                let pathStart = `M ${sourceX} ${sourceY}`;
                let pathEnd = `L ${targetX} ${targetY}`;
                let startDummy = layout.vertices[arc.path[0]];
                let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
                let pathMid = `L ${startDummy.x} ${startDummy.y} L ${endDummy.x} ${endDummy.y}`;

                g.append('path')
                    .attr('d', pathStart + pathMid + pathEnd)
                    .attr('stroke', color)
                    .attr('fill', 'none')
                    .attr('class', 'ocpn-arc')
                    .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
                    .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null); // TODO: set fill for arrowhead but not for the path
            } else {
                g.append('path')
                    .attr('d', `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`)
                    .attr('stroke', color)
                    .attr('class', 'ocpn-arc')
                    .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
                    .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null);
            }
        }

        for (const vertexId in layout.vertices) {
            const vertex = layout.vertices[vertexId];
            if (vertex.type === OCPNLayout.PLACE_TYPE) {
                g.append('circle')
                    .attr('cx', vertex.x)
                    .attr('cy', vertex.y)
                    .attr('r', 2.5) // TODO: user defined radius
                    .attr('class', 'ocpn-place')
                    .attr('fill', objectTypeColorMap.get(vertex.objectType) || 'black');
            } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
                g.append('rect')
                    .attr('x', vertex.x - 3.5)
                    .attr('y', vertex.y - 2.5)
                    .attr('width', 7) // TODO: user defined width
                    .attr('height', 5) // TODO: user defined height
                    .attr('class', 'ocpn-transition'); // TODO: color based on transition type
            }
        }


        // Calculate the bounding box of the layout
        const node = g.node();
        if (!node) return;
        const bbox = node.getBBox();
        const width = svgRef.clientWidth;
        const height = svgRef.clientHeight - 2 * padding;

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
            // TODO: layout is recomputed for the same layout if window size changes so much that the visualization area is closed and reopened.
            if (selectedOCPN && selectedOCPN !== previousOCPNRef.current) {
                // Clear the existing SVG content
                d3.select(svgRef.current!).selectAll('*').remove();
                // Temporary fix until OCPNLayout class implementation done.
                const ocpnLayout = await sugiyama(selectedOCPN, {});
                if (!ocpnLayout) return;
                // Map the OCPN to a layout
                mapOCPNToLayout(ocpnLayout, svgRef.current!);
                previousOCPNRef.current = selectedOCPN;
            }
        }
        updateVisualization();
    }, [selectedOCPN]);
    // TODO: d3 zoom and pan.
    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    border: '2px solid',
                    height: '98%',
                    width: '98%',
                    margin: '2%',
                    bgcolor: darkMode ? '#f7f5f0' : '#f7f5f0',
                    overflow: 'hidden',
                }}>
                <svg ref={svgRef} width="100%" height="100%"></svg>
            </Box>
        </Box>
    );
};

export default VisualizationArea;