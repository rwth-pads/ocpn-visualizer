const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');
const { clone2DArray } = require('../lib/arrays');

/**
 * Heuristic approach description:
 * 
 * Source: "Fast and Simple Horizontal Coordinate Assignment"
 * 
 * Objective:
 *      Align each vertex vertically (horizontally) with its median neighbor where possible.
 *
 * Overview:
 *      1. Vertical alignment -> try to align each vertex with either its median upper or median lower neighbor.
 *      2. Horizontal compaction -> aligned vertices are constrained to obtain the same x (y) coordinate.
 *          - Steps 1 and 2 are repeated for {up, down} x {leftmost, rightmost}.
 *      3. Combination of the four computed assignments -> balance their biases.
 * 
 *     - arcs are called segments
 *     - arcs between two dummy vertices are called inner segments
 * 
 * Types of conflicts:
 *      Type 0: a pair of non-inner segments that either cross or share a vertex.
 *      Type 1: non-inner segment crosses an inner segment.
 *      Type 2: two inner segments cross.
 *          -> type 2 should be avoided by the vertex ordering step. TODO: check if this is the case.
 *          -> alternatively, type 2 conflicts can be resolved by a preprocessing step:
 *                 - swapping the two lower vertices involved until the crossing is no longer between two inner segments.
 *          ->  If the ordering is more important than vertical inner segments, the original ordering can be restored in the final layout.
 *              - TODO: add user checkbox for this. if type 2 can occur at all.
 */

/**
 * Heuristic algorithm for the coordinate assignment of the vertices of the OCPN.
 * Guarantees vertical inner segments (dummy -> dummy), yields small edge lengths,
 * and a fair balance with respect to upper and lower neighbors.
 *
 * @param {*} ocpn The layered OCPN.
 * @param {*} layering The ordered layering of the OCPN, determining the relative position of the vertices.
 * @param {*} config User defined configurations for the vertex positioning.
 */
function positionVertices(ocpn, layering, config) {
    const FLOW_DIRECTION = 'down'; // or 'right' TODO
    const PLACE_RADIUS = 10;
    const TRANSITION_WIDTH = 40;
    const TRANSITION_HEIGHT = 20;
    const DUMMY_WIDTH = 5;
    const USER_DEFINED_RANK_SEP = 2;
    const LAYER_SEP = 10 + TRANSITION_HEIGHT * USER_DEFINED_RANK_SEP;
    const MIN_VERTEX_SEP = 10;
    // TODO: use the actual values from the user configuration.
    // --------------------------------------------------------------------------------

    // Mark type 1 conflicts in the OCPN given the layering.
    const conflictCount = markType1Conflicts(ocpn, layering);
    const layouts = [];
    console.log("Computing the four alignments...");
    for (const verticalDir in [0, 1]) { // 0: down, 1: up
        for (const horizontalDir in [0, 1]) { // 0: left, 1: right

            // Reverse the outer and inner layers depending on the directions.
            let [currentLayering, pos] = transformLayering(clone2DArray(layering), verticalDir, horizontalDir);

            // Align each vertex vertically with its median neighbor where possible.
            let [roots, aligns] = verticalAlignment(ocpn, currentLayering, pos, verticalDir == 0);

            // Determine coordinates subject to the current alignment.
            let [coords, maxCoord] = horizontalCompaction(ocpn, currentLayering, roots, aligns, pos);

            // If direction from right to left, flip coordinates back to original order.
            if (horizontalDir == 1) {
                for (let v in coords) {
                    coords[v] = maxCoord - coords[v];
                }
            }
            layouts.push(coords);
        }
    }
    // Align to assignment of smallest width (height).
    alignAssignments(layouts);
    // Set the actual coordinates to average median of aligned candidates.
    setCoordinates(ocpn, layering, layouts, config);
}

/**
 * Depending on the vertical and horizontal direction, the layering is transformed.
 * That is, the order of the layers and the order of the vertices within the layers are reversed.
 * 
 * @param {*} layering The original layering of the OCPN.
 * @param {*} verticalDir The vertical direction of the current alignment and compaction step.
 * @param {*} horizontalDir The horizontal direction of the current alignment and compaction step.
 * @returns The transformed layering.
 */
function transformLayering(layering, verticalDir, horizontalDir) {
    if (verticalDir == 1) {
        layering.reverse();
    }
    if (horizontalDir == 1) {
        layering.forEach(layer => layer.reverse());
    }

    var pos = [];
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            pos[layering[i][j]] = j;
        }
    }
    return [layering, pos];
}

/**
 * Marks the type 1 conflicts for non-inner segments in the OCPN given the layering.
 * A type 1 conflict occurs when a non-inner segment crosses an inner segment.
 * This step is necessary to keep long edges straight, leading to non-inner segments
 * crossing inner segments not being aligned in the following steps. 
 * 
 * @param {*} ocpn The OCPN.
 * @param {*} layering The ordered layering of the OCPN graph.
 */
function markType1Conflicts(ocpn, layering) {
    console.log("Marking type 1 conflicts...");

    // Between layer first and second (last - 1 and last) there cannot be any type 1 conflicts.
    for (let i = 1; i < layering.length - 2; i++) {
        const layer = layering[i];
        const nextLayer = layering[i + 1];
        let k0 = 0;
        let l = 0;

        // Check for type 1 conflicts between layer and next layer.
        for (let l1 = 0; l1 < nextLayer.length; l1++) {
            if (l1 == nextLayer.length - 1 || isIncidentToInnerSegment(ocpn, nextLayer[l1])) {
                let k1 = layer.length - 1;
                if (isIncidentToInnerSegment(ocpn, nextLayer[l1])) {
                    k1 = layer.indexOf(getUpperNeighbors(ocpn, nextLayer[l1])[0]);
                }
                while (l <= l1) {
                    getUpperNeighbors(ocpn, nextLayer[l]).forEach(upperNeighbor => {
                        let k = layer.indexOf(upperNeighbor);
                        if (k < k0 || k > k1) {
                            // Mark the arc from upperNeighbor to nextLayer[l] as type 1.
                            let arc = ocpn.arcs.filter(arc =>
                                arc.source.name == upperNeighbor && arc.target.name == nextLayer[l] ||
                                arc.source.name == nextLayer[l] && arc.target.name == upperNeighbor
                            ); // If arcs (u,v) and (v,u) exist, both are marked which is fine.
                            console.log(`\tMarking arc (${upperNeighbor} -> ${nextLayer[l]}) as type 1...`);
                            arc.forEach(a => {
                                if (!isIncidentToInnerSegment(ocpn, upperNeighbor) || !isIncidentToInnerSegment(ocpn, nextLayer[l])) {
                                    a.type1 = true;
                                }
                            });
                        }
                    });
                    l++;
                }
                k0 = k1;
            }
        }
    }
}

/** 
 * Aligns each vertex vertically with its median upper/lower neighbor where possible.
 * 
 * Since we transformed the layering according to the vertical and horizontal direction,
 * we can assume that the vertices are aligned from left to right and top to bottom.
 * @param {*} ocpn 
 * @param {*} layering 
 * @param {*} pos The current position of the vertices in their layer.
 * @param {*} down Boolean value indicating whether the alignment is from top to bottom.
 * @returns An array of the root and align values for each vertex.
 */
function verticalAlignment(ocpn, layering, pos, down) {
    var root = {}; // Each vertex has a reference to the root of its block.
    var align = {}; // Each vertex has a reference to its lower aligned neighbor.

    // Initialize root and align for each vertex.
    for (let i = 0; i < layering.length; i++) {
        for (let v of layering[i]) {
            root[v] = v;
            align[v] = v;
        }
    }

    // Perform vertical alignment.
    for (let i = 1; i < layering.length; i++) {
        const layer = layering[i];
        let r = -1; // Initialize r to a value that is not a valid position.
        for (let k = 0; k < layer.length; k++) {
            const v = layer[k];
            var neighbors = down ? getUpperNeighbors(ocpn, v) : getLowerNeighbors(ocpn, v);
            neighbors.sort((a, b) => pos[a] - pos[b]);
            if (neighbors.length > 0) {
                const lowerUpperMedians = [...new Set([Math.floor((neighbors.length - 1) / 2), Math.ceil((neighbors.length - 1) / 2)])];
                for (let m of lowerUpperMedians) {
                    if (align[v] == v) {
                        if (!isMarked(ocpn, neighbors[m], v) && r < pos[neighbors[m]]) {
                            align[neighbors[m]] = v;
                            root[v] = root[neighbors[m]];
                            align[v] = root[v];
                            r = pos[neighbors[m]];
                        }
                    }
                }
            }
        }
    }
    return [root, align];
}

function isMarked(ocpn, u, v) {
    let arc = ocpn.arcs.filter(arc =>
        arc.source.name == u && arc.target.name == v ||
        arc.source.name == v && arc.target.name == u
    );
    return arc.length > 0 && arc[0].type1;
}

/**
 * Coordinate assignment is determined subject to a vertical algignment. 
 * 
 * @param {*} ocpn 
 * @param {*} layering 
 */
function horizontalCompaction(ocpn, layering, roots, aligns, pos) {
    const MIN_VERTEX_SEP = 10; // TODO use user config.

    const x = {};
    const sink = {};
    const shift = {};

    // Initialize sink and shift for each vertex.
    for (let i = 0; i < layering.length; i++) {
        for (let v of layering[i]) {
            sink[v] = v;
            shift[v] = Infinity;
            x[v] = undefined;
        }
    }

    // Root coordinates relative to sink.
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            let v = layering[i][j];
            if (roots[v] == v) {
                placeBlock(layering, v, x, pos, roots, sink, shift, aligns, MIN_VERTEX_SEP);
            }
        }
    }

    // Absolute coordinates.
    let xMax = 0;
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            let v = layering[i][j];
            x[v] = x[roots[v]];
            if (shift[sink[roots[v]]] < Infinity) {
                x[v] = x[v] + shift[sink[roots[v]]];
            }
            xMax = Math.max(xMax, x[v]);
        }
    }

    return [x, xMax];
}


function placeBlock(layering, v, x, pos, roots, sink, shift, aligns, delta) {
    // TODO: The minimum separation can be chosen independently for each pair of
    // neighboring vertices differentiate between places, transitions, and dummies.
    if (x[v] == undefined) {
        x[v] = 0;
        var w = v;
        do {
            // If pos of the vertex is 0, there is no predecessor.
            if (pos[w] > 0) {
                // Get the layerindex of w.
                let layer = layering.findIndex(l => l.includes(w));
                // Get the predecessor of w. (The vertex to the left of w -> always exists because pos[w] > 0.)
                const predecessor = layering[layer][pos[w] - 1];
                // Get the root of the predecessor.
                const u = roots[predecessor];
                // Determine the coordinates of the predecessor's root. (Terminates once the vertex most to the left is reached.)
                placeBlock(layering, u, x, pos, roots, sink, shift, aligns, delta);
                // The sink is the root vertex with the smallest x coordinate.
                if (sink[v] == v) {
                    sink[v] = sink[u];
                }
                if (sink[v] != sink[u]) {
                    shift[sink[u]] = Math.min(shift[sink[u]], x[v] - x[u] - delta);
                } else {
                    // Maximum of own x and x of predecessor + minimum vertex separation.
                    x[v] = Math.max(x[v], x[u] + delta);
                }
            }
            w = aligns[w];
        } while (w != v);
    }
}

function alignAssignments(layouts) {
    console.log("Aligning the four layouts to the one with the smallest width (height)...");

    // Determine minimum and maximum coordinates for each layout.
    const minMax = layouts.map(coords => {
        const values = Object.values(coords);
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max, width: max - min };
    });

    // Determine the layout with the minimum width.
    const minWidthIndex = minMax.reduce((minIndex, current, index, arr) => {
        return current.width < arr[minIndex].width ? index : minIndex;
    }, 0);

    // console.log(minMax[minWidthIndex]);

    // Align all other layouts to the lowest coordinate of the layout with the minimum width.
    layouts.forEach((layout, i) => {
        const shift = i % 2 === 0
            ? minMax[i].min - minMax[minWidthIndex].min : // leftmost
            minMax[i].max - minMax[minWidthIndex].max; // rightmost

        for (let v in layout) {
            layout[v] += shift;
        }
    });
}

function setCoordinates(ocpn, layering, layouts, config) {
    console.log("Setting coordinates...");

    const LAYER_SEP = 20; // TODO: use user config.
    const BORDER_PADDING = 10;

    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            const v = ocpn.findElementByName(layering[i][j]);
            // Get the four candidate coordinates for the vertex in ascending order.
            const candidateCoords = layouts.map(layout => layout[v.name]).sort((a, b) => a - b);
            // Compute the average median of the four candidate coordinates.
            const medianCoord = Math.floor((candidateCoords[1] + candidateCoords[2]) / 2);
            // Set the vertex coordinates.
            v.x = medianCoord + BORDER_PADDING;
            v.y = i * LAYER_SEP + BORDER_PADDING;
            console.log(`\t${v.name}:\t(x: ${v.x}, y: ${v.y})`);
        }
    }
}

/**
 * Checks whether the vertex is incident to an inner segment.
 * A vertex is incident to an inner segment if it is a dummy and its upper neighbor is a dummy.
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} vertex 
 * @returns Boolean value indicating whether the vertex is incident to an inner segment.
 */
function isIncidentToInnerSegment(ocpn, vertex) {
    let v = ocpn.findElementByName(vertex);
    if (v instanceof ObjectCentricPetriNet.Dummy) {
        let upper = v.arcReversed ? v.to : v.from;
        if (upper instanceof ObjectCentricPetriNet.Dummy) {
            return true;
        }
    }
    return false;
}

/**
 * Gets the upper neighbors of the vertex in the OCPN layering.
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} vertex 
 * @returns An array of the names of the upper neighbors of the vertex.
 */
function getUpperNeighbors(ocpn, vertex) {
    let v = ocpn.findElementByName(vertex);
    if (v instanceof ObjectCentricPetriNet.Dummy) {
        let upper = v.arcReversed ? v.to : v.from;
        return [upper.name];
    } else {
        // V is place or transition.
        const upperInArcs = v.inArcs.filter(arc => !arc.reversed).map(arc => arc.source.name);
        const upperOutArcs = v.outArcs.filter(arc => arc.reversed).map(arc => arc.target.name);
        return [...upperInArcs, ...upperOutArcs];
    }
}

function getLowerNeighbors(ocpn, vertex) {
    let v = ocpn.findElementByName(vertex);
    if (v instanceof ObjectCentricPetriNet.Dummy) {
        let lower = v.arcReversed ? v.from : v.to;
        return [lower.name];
    } else {
        // V is place or transition.
        const lowerInArcs = v.inArcs.filter(arc => arc.reversed).map(arc => arc.source.name);
        const lowerOutArcs = v.outArcs.filter(arc => !arc.reversed).map(arc => arc.target.name);
        return [...lowerInArcs, ...lowerOutArcs];
    }
}

module.exports = positionVertices;