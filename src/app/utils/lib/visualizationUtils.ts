import { select } from 'd3-selection';
import OCPNLayout from '../classes/OCPNLayout';
import OCPNConfig from '../classes/OCPNConfig';
import { Point2D, Intersection } from 'kld-intersections';

export async function visualizeOCPN(layout: OCPNLayout, config: OCPNConfig, svgRef: SVGSVGElement | null) {
    console.time("Visualize OCPN");
    const svg = select(svgRef);
    const g = svg.append('g');

    // Define custom markers.
    const defineMarker = (color: string, id: string, objectType: string) => {
        svg.append('defs').append('marker')
            .attr('id', id)
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 8)
            .attr('refY', 5)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto-start-reverse')
            .attr('class', objectType)
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', color);
    };

    // Draw the arcs.
    for (const arcId in layout.arcs) {
        const arc = layout.arcs[arcId];
        var path = getArcPath(arcId, layout, config);
        // console.log(path);
        var ot = arc.objectType ? arc.objectType.replace(' ', '') : '';
        var color = config.typeColorMapping.get(ot) ?? config.arcDefaultColor;
        var strokeWidth = config.arcSize * (config.indicateArcWeight ? (arc.weight ?? 1) : 1);

        // // Define a combined mask for the arc that hides the parts of the arc that underlap with it's source and target.
        // const source = layout.vertices[arc.source]; // {name: 't3', label: 't3', x: 82.5, y: 87.5, type: ?, ...}
        // const target = layout.vertices[arc.target];
        // const maskId = `mask-${arcId}`;
        // const mask = svg.append('defs').append('mask').attr('id', maskId).attr('maskUnits', 'userSpaceOnUse');

        // // Add a white background to the mask.
        // mask.append('rect')
        //     .attr('width', '100%')
        //     .attr('height', '100%')
        //     .attr('fill', 'white');

        // if (source.type === OCPNLayout.PLACE_TYPE) {
        //     // Source is circle, target is rectangle.
        //     mask.append('circle')
        //         .attr('cx', source.x)
        //         .attr('cy', source.y)
        //         .attr('r', config.placeRadius)
        //         .attr('fill', 'black');

        //     let targetWidth = target.silent ? config.silentTransitionWidth : config.transitionWidth;

        //     mask.append('rect')
        //         .attr('x', target.x - targetWidth / 2)
        //         .attr('y', target.y - config.transitionHeight / 2)
        //         .attr('width', targetWidth)
        //         .attr('height', config.transitionHeight)
        //         .attr('fill', 'black');

        // } else if (source.type === OCPNLayout.TRANSITION_TYPE) {
        //     // Source is rectangle, target is circle.
        //     let sourceWidth = source.silent ? config.silentTransitionWidth : config.transitionWidth;

        //     mask.append('rect')
        //         .attr('x', source.x - sourceWidth / 2)
        //         .attr('y', source.y - config.transitionHeight / 2)
        //         .attr('width', sourceWidth)
        //         .attr('height', config.transitionHeight)
        //         .attr('fill', 'black');

        //     mask.append('circle')
        //         .attr('cx', target.x)
        //         .attr('cy', target.y)
        //         .attr('r', config.placeRadius)
        //         .attr('fill', 'black');
        // }

        defineMarker(color, `arrowhead-${arcId}`, ot);

        if (arc.variable) {
            g.append('path')
                .attr('d', path)
                .attr('stroke', config.variableArcIndicatorColor)
                // .attr('stroke-linecap', 'round')
                .attr('fill', 'none')
                .attr('id', arcId)
                .attr('class', `ocpnarc variable indicator ${ot}`)
                .attr('stroke-width', strokeWidth * config.variableArcIndicatorSize)
                // .attr('mask', `url(#${maskId})`)
                .attr('display', config.indicateVariableArcs ? 'block' : 'none');
        }

        g.append('path')
            .attr('d', path)
            .attr('stroke', color)
            .attr('fill', 'none')
            .attr('id', arcId)
            .attr('class', `ocpnarc ${ot}${arc.variable ? ' variable' : ''}`)
            // .attr('mask', `url(#${maskId})`)
            .attr('stroke-width', strokeWidth);

        // If the arc is variable make the path be a double line with a gap in between.
        if (arc.variable && config.indicateVariableArcs) {
            g.append('path')
                .attr('d', path)
                .attr('stroke', config.svgBackgroundColor)
                .attr('fill', 'none')
                .attr('id', arcId)
                .attr('class', `ocpnarc inner ${ot}${arc.variable ? ' variable' : ''}`)
                // .attr('mask', `url(#${maskId})`)
                .attr('stroke-width', strokeWidth * 0.4)
        }

        // Add an invisible path with the arrowheads.
        g.append('path')
            .attr('d', path)
            .attr('stroke', 'none')
            .attr('stroke-width', strokeWidth) // Set to adjust the arrowhead size based on stroke width.
            .attr('fill', 'none')
            .attr('id', `${arcId}-invisible`)
            .attr('class', `ocpnarc ${ot}`)
            .attr('marker-end', arc.reversed ? null : `url(#arrowhead-${arcId})`)
            // .attr('mask', `url(#${maskId})`)
            .attr('marker-start', arc.reversed ? `url(#arrowhead-${arcId})` : null);
    }

    // Draw the places and transitions.
    for (const vertexId in layout.vertices) {
        const vertex = layout.vertices[vertexId];
        if (vertex.type === OCPNLayout.PLACE_TYPE) {
            const ot = vertex.objectType ? vertex.objectType.replace(' ', '') : '';
            const fill = config.typeColorMapping.get(ot) ?? config.defaultPlaceColor;
            const source = config.sources.includes(vertexId);
            const sink = config.sinks.includes(vertexId);
            g.append('circle')
                .attr('cx', vertex.x ?? 0)
                .attr('cy', vertex.y ?? 0)
                .attr('r', config.placeRadius)
                .attr('id', vertexId)
                .attr('class', `ocpnplace ${ot}`)
                .attr('fill', fill);
            if (source && config.indicateSourcesSinks) {
                g.append('text')
                    .attr('x', vertex.x ?? 0)
                    .attr('y', vertex.y ?? 0)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', config.placeRadius)
                    .attr('fill', config.transitionTextColor)
                    .attr('id', vertexId)
                    .attr('class', `ocpnplace ${ot} label`)
                    .text('⯈');
            } else if (sink && config.indicateSourcesSinks) {
                g.append('text')
                    .attr('x', vertex.x ?? 0)
                    .attr('y', vertex.y ?? 0)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('font-size', config.placeRadius)
                    .attr('fill', config.transitionTextColor)
                    .attr('id', vertexId)
                    .attr('class', `ocpnplace ${ot} label`)
                    .text('■');
            } else if (config.indicateSourcesSinks) {
                g.append('circle')
                    .attr('cx', vertex.x ?? 0)
                    .attr('cy', vertex.y ?? 0)
                    .attr('r', config.placeRadius - 0.5)
                    .attr('class', `ocpnplace ${ot}`)
                    .attr('id', vertexId)
                    .attr('fill', config.svgBackgroundColor);
            }

            // g.append('text')
            //     .attr('x', vertex.x ?? 0)
            //     .attr('y', vertex.y ?? 0)
            //     .attr('text-anchor', 'middle')
            //     .attr('alignment-baseline', 'middle')
            //     .attr('font-size', config.placeRadius)
            //     .attr('fill', config.transitionTextColor)
            //     .attr('id', vertexId)
            //     .attr('class', `ocpnplace ${ot} label`)
            //     .text(vertexId);



        } else if (vertex.type === OCPNLayout.TRANSITION_TYPE) {
            const label = vertex.silent ? '𝜏' : vertex.label;
            let width = vertex.silent ? config.silentTransitionWidth : config.transitionWidth;
            let ots = vertex.adjacentObjectTypes ? Array.from(vertex.adjacentObjectTypes) : [];
            g.append('rect')
                .attr('x', (vertex.x ?? 0) - width / 2)
                .attr('y', (vertex.y ?? 0) - config.transitionHeight / 2)
                .attr('width', width)
                .attr('height', config.transitionHeight)
                .attr('fill', config.transitionFillColor)
                .attr('stroke', config.transitionColor)
                .attr('stroke-width', config.transitionBorderSize)
                .attr('class', 'ocpntransition')
                .attr('adjacentObjectTypes', ots.join(' '))
                .attr('id', vertexId);

            // Append the text element with an initial font size
            const textElement = g.append('text')
                .attr('x', vertex.x ?? 0)
                .attr('y', vertex.y ?? 0)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', '20px') // Initial font size
                .attr('fill', config.transitionTextColor)
                .text(label)
                .attr('user-select', 'none')
                .attr('class', 'ocpntransition label')
                .attr('adjacentObjectTypes', ots.join(' '))
                .attr('id', vertexId);

            // Adjust the font size to fit within the rectangle
            const adjustFontSize = () => {
                const node = textElement.node();
                if (!node) return;
                let bbox = node.getBBox();
                const maxWidth = config.transitionWidth * 0.99;
                const maxHeight = config.transitionHeight * 1;
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
        // else { // Dummy vertices: just for debugging.
        //     g.append('circle')
        //         .attr('cx', vertex.x ?? 0)
        //         .attr('cy', vertex.y ?? 0)
        //         .attr('r', config.placeRadius / 2)
        //         .attr('fill', 'red')
        //         .attr('id', vertexId)
        //         .attr('class', 'ocpnvertex')
        //         .attr('text-anchor', 'middle');

        //     g.append('text')
        //         .attr('x', vertex.x ?? 0)
        //         .attr('y', vertex.y ?? 0)
        //         .attr('text-anchor', 'middle')
        //         .attr('alignment-baseline', 'middle')
        //         .attr('font-size', config.placeRadius)
        //         .text(vertexId);
        // }
    }
    console.timeEnd("Visualize OCPN");
    return svg;
}

function getArcPath(arcId: string, layout: OCPNLayout, config: OCPNConfig): string {
    var path = '';
    var arc = layout.arcs[arcId];
    var source = layout.vertices[arc.source];
    var target = layout.vertices[arc.target];

    var sourcePoint = undefined;
    if (source.type === OCPNLayout.PLACE_TYPE) {
        let center = new Point2D(source.x ?? 0, source.y ?? 0);
        let p1 = new Point2D(source.x ?? 0, source.y ?? 0);
        let p2 = new Point2D(target.x ?? 0, target.y ?? 0);
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            p2 = new Point2D(startDummy.x ?? 0, (startDummy.y ?? 0));
        }
        // Construct the line.
        sourcePoint = getPlaceIntersectionPoint(center, config.placeRadius, p1, p2, source.x ?? 0, (source.y ?? 0) + config.placeRadius);
    } else {
        let p1 = new Point2D(source.x ?? 0, source.y ?? 0);
        let p2 = new Point2D(target.x ?? 0, target.y ?? 0);
        if (arc.path.length > 0) {
            let startDummy = layout.vertices[arc.path[0]];
            p2 = new Point2D(startDummy.x ?? 0, (startDummy.y ?? 0));
        }
        const halfWidth = (source.silent ? config.silentTransitionWidth : config.transitionWidth) / 2;
        const halfHeight = config.transitionHeight / 2;
        const topLeft = new Point2D((source.x ?? 0) - halfWidth, (source.y ?? 0) - halfHeight);
        const bottomRight = new Point2D((source.x ?? 0) + halfWidth, (source.y ?? 0) + halfHeight);
        // Construct the rectangle.
        sourcePoint = getTransitionIntersectionPoint(p1, p2, topLeft, bottomRight, source.x ?? 0, (source.y ?? 0) + halfHeight);
    }
    path += `M ${sourcePoint.x} ${sourcePoint.y}`;
    var targetPoint = undefined;
    if (target.type === OCPNLayout.PLACE_TYPE) {
        let center = new Point2D(target.x ?? 0, target.y ?? 0);
        let p1 = new Point2D(source.x ?? 0, source.y ?? 0);
        if (arc.path.length > 0) {
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            p1 = new Point2D(endDummy.x ?? 0, (endDummy.y ?? 0));
        }
        let p2 = new Point2D(target.x ?? 0, target.y ?? 0);
        // Construct the line.
        targetPoint = getPlaceIntersectionPoint(center, config.placeRadius, p1, p2, target.x ?? 0, (target.y ?? 0) - config.placeRadius);
    } else {
        // Update the lower adjustment for the dummy.
        let p1 = new Point2D(source.x ?? 0, source.y ?? 0);
        if (arc.path.length > 0) {
            let endDummy = layout.vertices[arc.path[arc.path.length - 1]];
            p1 = new Point2D(endDummy.x ?? 0, (endDummy.y ?? 0));
        }
        let p2 = new Point2D(target.x ?? 0, target.y ?? 0);
        const halfWidth = (target.silent ? config.silentTransitionWidth : config.transitionWidth) / 2;
        const halfHeight = config.transitionHeight / 2;
        const topLeft = new Point2D((target.x ?? 0) - halfWidth, (target.y ?? 0) - halfHeight);
        const bottomRight = new Point2D((target.x ?? 0) + halfWidth, (target.y ?? 0) + halfHeight);
        // Construct the rectangle.
        targetPoint = getTransitionIntersectionPoint(p1, p2, topLeft, bottomRight, target.x ?? 0, (target.y ?? 0) - halfHeight);
    }
    // If the arc has path points, add them to the path.
    for (let i = 0; i < arc.path.length; i++) {
        let dummy = layout.vertices[arc.path[i]];
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