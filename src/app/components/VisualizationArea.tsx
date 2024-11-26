import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNLayout from '../utils/classes/OCPNLayout';
import OCPNConfig from '../utils/classes/OCPNConfig';
import sugiyama from '../utils/sugiyama/sugiyama.js';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    darkMode: boolean;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, darkMode }) => {
    const svgRef = useRef<SVGSVGElement>(null!); // Initialize as not null
    const padding = 20; // Define padding value
    const previousOCPNRef = useRef<ObjectCentricPetriNet | null>(null);

    function mapOCPNToLayout(layout: OCPNLayout, config: OCPNConfig, svgRef: SVGSVGElement) {
        // Create objectType -> color mapping
        const objectTypeColorMap: Map<string, string> = new Map();
        let colorIndex = 0;
        for (const objectType of layout.objectTypes) {
            objectTypeColorMap.set(objectType, COLORS_ARRAY[colorIndex]);
            colorIndex = (colorIndex + 1) % COLORS_ARRAY.length;
        }

        const svg = d3.select(svgRef);
        const g = svg.append('g');

        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 10)
            .attr('refY', 5)
            .attr('markerWidth', config.arrowHeadSize)
            .attr('markerHeight', config.arrowHeadSize)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', 'context-stroke');

        for (const arcId in layout.arcs) {
            const arc = layout.arcs[arcId];
            var path = getArcPath(arcId, layout, config);
            // console.log(`Source: ${arc.source}, Target: ${arc.target}`);
            // console.log(`Source: ${layout.vertices[arc.source].x}, ${layout.vertices[arc.source].y}`);
            // console.log(`Target: ${layout.vertices[arc.target].x}, ${layout.vertices[arc.target].y}`);
            // console.log("\t", path);
            var ot = arc.objectType;
            var color = objectTypeColorMap.get(ot) || config.arcDefaultColor;
            g.append('path')
                .attr('d', path)
                .attr('stroke', color)
                .attr('fill', 'none')
                .attr('id', arcId)
                .attr('class', 'ocpnarc')
                .attr('stroke-width', config.arcSize * (arc.weight ?? 1))
                .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
                .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null); // TODO: set fill for arrowhead but not for the path
        }

        for (const vertexId in layout.vertices) {
            const vertex = layout.vertices[vertexId];
            if (vertex.type === OCPNLayout.PLACE_TYPE) {
                g.append('circle')
                    .attr('cx', vertex.x)
                    .attr('cy', vertex.y)
                    .attr('r', config.placeRadius) // TODO: user defined radius
                    .attr('id', vertexId)
                    .attr('class', 'ocpnplace')
                    .attr('fill', objectTypeColorMap.get(vertex.objectType) || config.defaultPlaceColor);

                // g.append('text')
                //     .attr('x', vertex.x)
                //     .attr('y', vertex.y)
                //     .attr('text-anchor', 'middle')
                //     .attr('alignment-baseline', 'middle')
                //     .attr('font-size', '3px')
                //     .attr('fill', 'black')
                //     .text(vertexId);
            } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
                g.append('rect')
                    .attr('x', vertex.x - config.transitionWidth / 2)
                    .attr('y', vertex.y - config.transitionHeight / 2)
                    .attr('width', config.transitionWidth) // TODO: user defined width
                    .attr('height', config.transitionHeight) // TODO: user defined height
                    .attr('id', vertexId)
                    .attr('class', 'ocpntransition')
                    .attr('fill', config.transitionFillColor)
                    .attr('stroke', config.transitionColor)
                    .attr('stroke-width', config.transitionBorderSize); // TODO: color based on transition type

                g.append('text')
                    .attr('x', vertex.x)
                    .attr('y', vertex.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', '3px')
                    .attr('fill', 'black')
                    .text(vertex.label);
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
        // TODO: d3 zoom and pan.
    }

    function getArcPath(arcId: string, layout: OCPNLayout, config: OCPNConfig): string {
        var path = '';
        var arc = layout.arcs[arcId];
        var sourcePoint = getArcConnectionPoint(arcId, true, layout, config);
        path += `M ${sourcePoint.x} ${sourcePoint.y}`;
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            // let dummyAdjust = layout.layerSizes.find(layerSize => layerSize.layer === endDummy.layer).size || 0;
            path += ` L ${startDummy.x} ${startDummy.y} L ${endDummy.x} ${endDummy.y}`;
        }
        var targetPoint = getArcConnectionPoint(arcId, false, layout, config);
        path += ` L ${targetPoint.x} ${targetPoint.y}`;
        return path;
    }

    function getArcConnectionPoint(arcId: string, isSource: boolean, layout: OCPNLayout, config: OCPNConfig): Point {
        let arc = layout.arcs[arcId];
        let vertexId = isSource ? arc.source : arc.target;
        let vertex = layout.vertices[vertexId];
        if (vertex.type === OCPNLayout.PLACE_TYPE) {
            return { x: vertex.x, y: vertex.y + (config.placeRadius) * (isSource ? 1 : -1) };
        } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
            return { x: vertex.x, y: vertex.y + (config.transitionHeight / 2) * (isSource ? 1 : -1) };
        }
        return { x: 0, y: 0 };
    }

    interface Point {
        x: number;
        y: number;
    }

    useEffect(() => {
        const updateVisualization = async () => {
            // TODO: layout is recomputed for the same layout if window size changes so much that the visualization area is closed and reopened.
            if (selectedOCPN && selectedOCPN !== previousOCPNRef.current) {
                // Clear the existing SVG content
                d3.select(svgRef.current!).selectAll('*').remove();

                const ocpnLayout: OCPNLayout = await sugiyama(selectedOCPN, userConfig);

                if (!ocpnLayout) return;
                // Map the OCPN to a layout
                // console.log(ocpnLayout);
                mapOCPNToLayout(ocpnLayout, userConfig, svgRef.current!);
                previousOCPNRef.current = selectedOCPN;
            }
        }
        updateVisualization();
    }, [selectedOCPN, userConfig]);

    return (
        <Box
            sx={{
                height: '90vh',
                width: '100vw',
                bgcolor: darkMode ? '#ffffff' : '#ffffff',
                overflow: 'hidden',
            }}>
            <Box
                sx={{
                    border: '2px solid black',
                    height: '88vh',
                    width: '98vw',
                    margin: '1vh 1vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <svg ref={svgRef} width="100%" height="100%"></svg>
            </Box>
        </Box>
    );
};

export default VisualizationArea;