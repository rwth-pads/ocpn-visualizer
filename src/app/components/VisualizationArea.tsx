import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNLayout from '../utils/classes/OCPNLayout';
import OCPNConfig from '../utils/classes/OCPNConfig';
import sugiyama from '../utils/sugiyama/sugiyama.js';
import './place.css';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    darkMode: boolean;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, darkMode }) => {
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

        // Define arrowhead marker. TODO: change color based on object type
        // TODO: arrow should not go into the place or transition.
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
            .attr('class', 'marker-arrow-fill');

        for (const arcId in layout.arcs) {
            const arc = layout.arcs[arcId];
            var path = getArcPath(arcId, layout, config);
            console.log(`Source: ${arc.source}, Target: ${arc.target}`);
            console.log(`Source: ${layout.vertices[arc.source].x}, ${layout.vertices[arc.source].y}`);
            console.log(`Target: ${layout.vertices[arc.target].x}, ${layout.vertices[arc.target].y}`);
            console.log("\t", path);
            var ot = arc.objectType;
            var color = objectTypeColorMap.get(ot) || config.arcDefaultColor;
            g.append('path')
                .attr('d', path)
                .attr('stroke', color)
                .attr('fill', 'none')
                .attr('stroke-width', config.arcSize)
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
                    .attr('class', 'ocpn-place')
                    .attr('id', vertexId)
                    .attr('fill', objectTypeColorMap.get(vertex.objectType) || 'black');

                g.append('text')
                    .attr('x', vertex.x)
                    .attr('y', vertex.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', '3px')
                    .attr('fill', 'black')
                    .text(vertexId);
            } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
                g.append('rect')
                    .attr('x', vertex.x - config.transitionWidth / 2)
                    .attr('y', vertex.y - config.transitionHeight / 2)
                    .attr('width', config.transitionWidth) // TODO: user defined width
                    .attr('height', config.transitionHeight) // TODO: user defined height
                    .attr('id', vertexId)
                    .attr('class', 'ocpn-transition'); // TODO: color based on transition type

                g.append('text')
                    .attr('x', vertex.x)
                    .attr('y', vertex.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', '3px')
                    .attr('fill', 'black')
                    .text(vertexId);
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

    useEffect(() => {
        const updateVisualization = async () => {
            // TODO: layout is recomputed for the same layout if window size changes so much that the visualization area is closed and reopened.
            if (selectedOCPN && selectedOCPN !== previousOCPNRef.current) {
                // Clear the existing SVG content
                d3.select(svgRef.current!).selectAll('*').remove();
                const ocpnConfig = getUserConfig(); // Initialize with the user selected values.
                console.log(ocpnConfig);
                const ocpnLayout: OCPNLayout = await sugiyama(selectedOCPN, ocpnConfig);
                if (!ocpnLayout) return;
                // Map the OCPN to a layout
                console.log(ocpnLayout);
                mapOCPNToLayout(ocpnLayout, ocpnConfig, svgRef.current!);
                previousOCPNRef.current = selectedOCPN;
            }
        }
        updateVisualization();
    }, [selectedOCPN]);

    // TODO: Get the actual values from the user.
    function getUserConfig(): OCPNConfig {
        let sources: string[] = [];
        let sinks: string[] = [];
        let objectCentrality = {};
        let maxBarycenterIterations = 4;
        let objectAttraction = 0.1;
        let objectAttractionRangeMin = 1;
        let objectAttractionRangeMax = 2;
        let direction = "TB";
        let placeRadius = 5;
        let transitionWidth = 20;
        let transitionHeight = 5;
        let dummySize = 2;
        let layerSep = 10;
        let vertexSep = 10; // For now bigger than any other size declaration to avoid overlapping. TODO
        let borderPaddingX = 10;
        let borderPaddingY = 10;
        let typeColorMapping = {};
        let defaultPlaceColor = "#0000000";
        let transitionColor = "#000000";
        let transitionFillColor = "#ffffff";
        let transitionBorderSize = 0.3;
        let arcSize = 0.6;
        let arrowHeadSize = 5;
        let arcDefaultColor = "#000000";
        return new OCPNConfig(
            sources,
            sinks,
            objectCentrality,
            maxBarycenterIterations,
            objectAttraction,
            objectAttractionRangeMin,
            objectAttractionRangeMax,
            direction,
            placeRadius,
            transitionWidth,
            transitionHeight,
            dummySize,
            layerSep,
            vertexSep,
            borderPaddingX,
            borderPaddingY,
            typeColorMapping,
            defaultPlaceColor,
            transitionColor,
            transitionFillColor,
            transitionBorderSize,
            arcSize,
            arrowHeadSize,
            arcDefaultColor
        );
    }

    function getArcPath(arcId: String, layout: OCPNLayout, config: OCPNConfig): string {
        var path = '';
        var arc = layout.arcs[arcId];
        var sourcePoint = getArcConnectionPoint(arcId, true, layout, config);
        path += `M ${sourcePoint.x} ${sourcePoint.y}`;
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            let dummyAdjust = layout.layerSizes.find(layerSize => layerSize.layer === endDummy.layer).size || 0;
            path += ` L ${startDummy.x} ${startDummy.y} L ${endDummy.x} ${endDummy.y + dummyAdjust}`;
        }
        var targetPoint = getArcConnectionPoint(arcId, false, layout, config);
        path += ` L ${targetPoint.x} ${targetPoint.y}`;
        return path;
    }

    function getArcConnectionPoint(arcId: String, isSource: boolean, layout: OCPNLayout, config: OCPNConfig): Point {
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