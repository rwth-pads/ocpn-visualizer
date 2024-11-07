import React, { useEffect, useRef } from 'react';
import Box from "@mui/material/Box";
import * as d3 from 'd3';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove(); // Clear existing elements

            const width = svgRef.current.clientWidth;
            const height = svgRef.current.clientHeight;

            if (selectedOCPN) {
                // Apply sugiyama algorithm to the selectedOCPN
                // Construct svg based on the returned layouting data for the OCPN.
            } else {
                const circleR = 20;
                const rectW = 160;
                const rectH = 40;
                const adjustX = rectW / 2;
                const heightStep = height / 14;

                // Add arrow marker
                svg.append('defs').append('marker')
                    .attr('id', 'arrow')
                    .attr('viewBox', '0 0 10 10')
                    .attr('refX', 10)
                    .attr('refY', 5)
                    .attr('markerWidth', 6)
                    .attr('markerHeight', 6)
                    .attr('orient', 'auto-start-reverse')
                    .append('path')
                    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                    .attr('fill', 'black');

                // Add circles and rectangles
                const elements = [
                    { type: 'circle', cx: width / 2, cy: heightStep, r: circleR, fill: 'lightblue' },
                    { type: 'rect', x: width / 2 - adjustX, y: heightStep * 3 - rectH / 2, width: rectW, height: rectH, fill: 'none', stroke: 'black', strokeWidth: 2, text: 'Import OCPN' },
                    { type: 'circle', cx: width / 2, cy: heightStep * 5, r: circleR, fill: 'lightblue' },
                    { type: 'rect', x: width / 2 - adjustX, y: heightStep * 7 - rectH / 2, width: rectW, height: rectH, fill: 'none', stroke: 'black', strokeWidth: 2, text: 'Visualize OCPN' },
                    { type: 'circle', cx: width / 2, cy: heightStep * 9, r: circleR, fill: 'lightblue' },
                    { type: 'rect', x: width / 2 - adjustX, y: heightStep * 11 - rectH / 2, width: rectW, height: rectH, fill: 'none', stroke: 'black', strokeWidth: 2, text: 'Export OCPN' },
                    { type: 'circle', cx: width / 2, cy: heightStep * 13, r: circleR, fill: 'lightblue' },
                ];

                elements.forEach((element, index) => {
                    if (element.type === 'circle') {
                        svg.append('circle')
                            .attr('cx', element.cx)
                            .attr('cy', element.cy)
                            .attr('r', element.r)
                            .style('fill', element.fill);
                    } else if (element.type === 'rect') {
                        svg.append('rect')
                            .attr('x', element.x)
                            .attr('y', element.y)
                            .attr('width', element.width)
                            .attr('height', element.height)
                            .style('fill', element.fill)
                            .style('stroke', element.stroke)
                            .style('stroke-width', element.strokeWidth);

                        svg.append('text')
                            .attr('x', element.x + element.width / 2)
                            .attr('y', element.y + element.height / 2)
                            .attr('dy', '.35em')
                            .attr('text-anchor', 'middle')
                            .text(element.text)
                            .style('fill', 'black')
                            .style('font-size', '20px');
                    }

                    // Add edges with arrowheads
                    if (index > 0) {
                        const prevElement = elements[index - 1];
                        const x1 = prevElement.type === 'circle' ? prevElement.cx : prevElement.x + prevElement.width / 2;
                        const y1 = prevElement.type === 'circle' ? prevElement.cy + prevElement.r : prevElement.y + prevElement.height;
                        const x2 = element.type === 'circle' ? element.cx : element.x + element.width / 2;
                        const y2 = element.type === 'circle' ? element.cy - element.r : element.y;

                        svg.append('line')
                            .attr('x1', x1)
                            .attr('y1', y1)
                            .attr('x2', x2)
                            .attr('y2', y2)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 3)
                            .attr('marker-end', 'url(#arrow)');
                    }
                    // Add red token (small red circle) and animate it
                    const token = svg.append('circle')
                        .attr('cx', width / 2)
                        .attr('cy', heightStep)
                        .attr('r', 7)
                        .style('fill', 'red');

                    const animateToken = () => {
                        token.transition()
                            .duration(5000)
                            .attr('cy', heightStep * 13)
                            .style('opacity', 1) // Ensure token is visible at the start
                            .on('end', () => {
                                token.attr('cy', heightStep)
                                    .style('opacity', 0); // Move token to the top and make it invisible
                                token.transition()
                                    .duration(1000)
                                    .style('opacity', 1) // Fade in at the top
                                    .on('end', animateToken);
                            });
                    };

                    animateToken();

                });


            }
        }
    }, [selectedOCPN]);

    return (
        <Box
            sx={{
                border: '2px dotted',
                borderColor: 'primary.main',
                borderRadius: 0,
                m: 2,
                p: 0,
                height: 'auto',
                width: 'auto', // Ensure the box takes the full height
            }}
        >
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </Box>
    );
};

export default VisualizationArea;