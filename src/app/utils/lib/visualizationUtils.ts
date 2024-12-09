import * as d3 from 'd3';
// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';
import OCPNConfig from '../classes/OCPNConfig';
import { Point2D, Intersection } from 'kld-intersections';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

export async function visualizeOCPN(layout: OCPNLayout, config: OCPNConfig, svgRef: SVGSVGElement | null) {
    console.time("Visualize OCPN");
    const svg = d3.select(svgRef);
    const g = svg.append('g');

    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', config.arrowHeadSize + 5)
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
        var ot = arc.objectType;
        var color = config.typeColorMapping.get(ot) || config.arcDefaultColor;
        g.append('path')
            .attr('d', path)
            .attr('stroke', color)
            .attr('fill', 'none')
            .attr('id', arcId)
            .attr('class', 'ocpnarc')
            .attr('stroke-width', config.arcSize * (config.indicateArcWeight ? (arc.weight ?? 1) : 1))
            .attr('marker-end', arc.reversed ? null : 'url(#arrowhead)')
            .attr('marker-start', arc.reversed ? 'url(#arrowhead)' : null); // TODO: set fill for arrowhead but not for the path
    }

    for (const vertexId in layout.vertices) {
        const vertex = layout.vertices[vertexId];
        if (vertex.type === OCPNLayout.PLACE_TYPE) {
            // TODO: if checkbox 'indicate sources and sinks' is checked, then add a source/sink indicator
            // otherwise, just draw a circle with fill color.
            const fill = config.typeColorMapping.get(vertex.objectType) || config.defaultPlaceColor;
            const source = config.sources.includes(vertexId);
            const sink = config.sinks.includes(vertexId);
            g.append('circle')
                .attr('cx', vertex.x)
                .attr('cy', vertex.y)
                .attr('r', config.placeRadius) // TODO: user defined radius
                .attr('id', vertexId)
                .attr('class', 'ocpnplace')
                .attr('fill', fill);
            if (source && config.indicateSourcesSinks) {
                g.append('text')
                    .attr('x', vertex.x)
                    .attr('y', vertex.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', config.placeRadius) // Adjust font size as needed
                    .attr('fill', 'black')
                    .attr('id', vertexId)
                    .attr('class', 'ocpnplace')
                    .text('⯈');
            } else if (sink && config.indicateSourcesSinks) {
                g.append('text')
                    .attr('x', vertex.x)
                    .attr('y', vertex.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', config.placeRadius) // Adjust font size as needed
                    .attr('fill', 'black')
                    .attr('id', vertexId)
                    .attr('class', 'ocpnplace')
                    .text('■');
            } else if (config.indicateSourcesSinks) {
                g.append('circle')
                    .attr('cx', vertex.x)
                    .attr('cy', vertex.y)
                    .attr('r', config.placeRadius - 0.5) // config.placeBorderSize) // TODO: user defined radius
                    .attr('class', 'ocpnplace')
                    .attr('id', vertexId)
                    .attr('fill', 'white');
            }

            // g.append('text')
            //     .attr('x', vertex.x)
            //     .attr('y', vertex.y)
            //     .attr('text-anchor', 'middle')
            //     .attr('alignment-baseline', 'middle')
            //     .attr('font-size', '3px')
            //     .attr('fill', 'black')
            //     .text(vertexId);
        } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
            const label = vertex.silent ? '𝜏' : vertex.label;
            // TODO: custom silent width (and height).
            let width = vertex.silent ? config.silentTransitionWidth : config.transitionWidth;
            g.append('rect')
                .attr('x', vertex.x - width / 2)
                .attr('y', vertex.y - config.transitionHeight / 2)
                .attr('width', width) // TODO: user defined width
                .attr('height', config.transitionHeight) // TODO: user defined height
                .attr('fill', config.transitionFillColor)
                .attr('stroke', config.transitionColor)
                .attr('stroke-width', config.transitionBorderSize) // TODO: color based on transition type
                .attr('class', 'ocpntransition')
                .attr('id', vertexId);

            // Append the text element with an initial font size
            const textElement = g.append('text')
                .attr('x', vertex.x)
                .attr('y', vertex.y)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', '20px') // Initial font size
                .attr('fill', 'black')
                .text(label) // TODO: reset to label
                .attr('user-select', 'none')
                .attr('class', 'ocpntransition')
                .attr('id', vertexId);

            // Adjust the font size to fit within the rectangle
            const adjustFontSize = () => {
                const node = textElement.node();
                if (!node) return;
                let bbox = node.getBBox();
                const maxWidth = config.transitionWidth * 0.99; // Adjust as needed
                const maxHeight = config.transitionHeight * 1; // Adjust as needed
                let fontSize = parseFloat(textElement.attr('font-size'));

                while ((bbox.width > maxWidth || bbox.height > maxHeight) && fontSize > 1) {
                    fontSize -= 1;
                    textElement.attr('font-size', `${fontSize}px`);
                    const textNode = textElement.node();
                    if (textNode) {
                        bbox = textNode.getBBox();
                    }
                }
            };

            adjustFontSize();
        }
        //  else if (vertex.type === OCPNLayout.DUMMY_TYPE) {
        //     g.append('circle')
        //         .attr('cx', vertex.x)
        //         .attr('cy', vertex.y)
        //         .attr('r', 2)
        //         .attr('fill', 'red')
        //         .attr('class', 'ocpndummy')
        //         .attr('id', vertexId);

        //     g.append('text')
        //         .attr('x', vertex.x)
        //         .attr('y', vertex.y)
        //         .attr('text-anchor', 'middle')
        //         .attr('alignment-baseline', 'middle')
        //         .attr('font-size', '3px')
        //         .attr('fill', 'black')
        //         .text(vertexId);
        // }

        // g.append('circle')
        //     .attr('cx', vertex.x)
        //     .attr('cy', vertex.y)
        //     .attr('r', 0.4)
        //     .attr('fill', 'red')
    }

    // Calculate the bounding box of the layout
    const node = g.node();
    if (!node) return;
    const bbox = node.getBBox();
    const width = svgRef.clientWidth;
    const height = svgRef.clientHeight - 2 * config.borderPaddingX;

    // Calculate scaling and translation to fit and center the layout with padding
    const scale = Math.min((width - 2 * config.borderPaddingX) / bbox.width, (height - 2 * config.borderPaddingX) / bbox.height);
    const translateX = (width - bbox.width * scale) / 2 - bbox.x * scale + config.borderPaddingX;
    // const translateX = padding - bbox.x * scale;
    const translateY = (height - bbox.height * scale) / 2 - bbox.y * scale + config.borderPaddingX;

    // Apply transformations
    g.attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    // TODO: d3 zoom and pan.
    console.timeEnd("Visualize OCPN");
    return svg;
}

function getArcPath(arcId: string, layout: OCPNLayout, config: OCPNConfig): string {
    var path = '';
    var arc = layout.arcs[arcId];
    var source = layout.vertices[arc.source];
    var target = layout.vertices[arc.target];
    let upperDummyAdjust = 0;
    let lowerDummyAdjust = 0;

    var sourcePoint = undefined;
    if (source.type === OCPNLayout.PLACE_TYPE) {
        // Update the upper adjustment for the dummy.
        upperDummyAdjust = config.placeRadius;
        let center = new Point2D(source.x, source.y);
        let p1 = new Point2D(source.x, source.y);
        let p2 = new Point2D(target.x, target.y);
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            p2 = new Point2D(startDummy.x, startDummy.y - upperDummyAdjust);
        }
        // Construct the line.
        sourcePoint = getPlaceIntersectionPoint(center, config.placeRadius, p1, p2, source.x, source.y + config.placeRadius);
    } else {
        // Update the upper adjustment for the dummy.
        upperDummyAdjust = config.transitionHeight / 2;
        let p1 = new Point2D(source.x, source.y);
        let p2 = new Point2D(target.x, target.y);
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            p2 = new Point2D(startDummy.x, startDummy.y - upperDummyAdjust);
        }
        const halfWidth = (source.silent ? config.silentTransitionWidth : config.transitionWidth) / 2;
        const halfHeight = config.transitionHeight / 2;
        const topLeft = new Point2D(source.x - halfWidth, source.y - halfHeight);
        const bottomRight = new Point2D(source.x + halfWidth, source.y + halfHeight);
        // Construct the rectangle.
        sourcePoint = getTransitionIntersectionPoint(p1, p2, topLeft, bottomRight, source.x, source.y + halfHeight);
    }
    path += `M ${sourcePoint.x} ${sourcePoint.y}`;
    var targetPoint = undefined;
    if (target.type === OCPNLayout.PLACE_TYPE) {
        // Update the lower adjustment for the dummy.
        lowerDummyAdjust = config.placeRadius;
        let center = new Point2D(target.x, target.y);
        let p1 = new Point2D(source.x, source.y);
        if (arc.path.length > 0) {
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            p1 = new Point2D(endDummy.x, endDummy.y + lowerDummyAdjust);
        }
        let p2 = new Point2D(target.x, target.y);
        // Construct the line.
        targetPoint = getPlaceIntersectionPoint(center, config.placeRadius, p1, p2, target.x, target.y - config.placeRadius);
    } else {
        // Update the lower adjustment for the dummy.
        lowerDummyAdjust = config.transitionHeight / 2;
        let p1 = new Point2D(source.x, source.y);
        if (arc.path.length > 0) {
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            p1 = new Point2D(endDummy.x, endDummy.y + lowerDummyAdjust);
        }
        let p2 = new Point2D(target.x, target.y);
        const halfWidth = (target.silent ? config.silentTransitionWidth : config.transitionWidth) / 2;
        const halfHeight = config.transitionHeight / 2;
        const topLeft = new Point2D(target.x - halfWidth, target.y - halfHeight);
        const bottomRight = new Point2D(target.x + halfWidth, target.y + halfHeight);
        // Construct the rectangle.
        targetPoint = getTransitionIntersectionPoint(p1, p2, topLeft, bottomRight, target.x, target.y - halfHeight);
    }
    // If the arc has path points, add them to the path.
    for (let i = 0; i < arc.path.length; i++) {
        let dummy = layout.vertices[arc.path[i]];
        if (i === 0) {
            dummy.y -= upperDummyAdjust;
        }
        if (i === arc.path.length - 1) {
            dummy.y += lowerDummyAdjust
        }
        path += ` L ${dummy.x}, ${dummy.y}`;
    }
    path += ` L ${targetPoint.x} ${targetPoint.y}`;
    return path;
}

function getPlaceIntersectionPoint(center: Point2D, r: number, p1: Point2D, p2: Point2D, x: number, y: number): { x: number, y: number } {
    const point = Intersection.intersectCircleLine(center, r, p1, p2);
    if (point.status === 'Intersection') {
        return { x: point.points[0].x, y: point.points[0].y };
    } else {
        return { x: x, y: y };
    }
}

function getTransitionIntersectionPoint(p1: Point2D, p2: Point2D, topLeft: Point2D, bottomRight: Point2D, x: number, y: number): { x: number, y: number } {
    const point = Intersection.intersectLineRectangle(p1, p2, topLeft, bottomRight);
    if (point.status === 'Intersection') {
        return { x: point.points[0].x, y: point.points[0].y };  
    } else {
        return { x: x, y: y };
    }
}