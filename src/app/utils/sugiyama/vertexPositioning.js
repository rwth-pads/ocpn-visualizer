import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';
import { clone2DArray } from '../lib/arrays';

/**
 * Heuristic algorithm for the coordinate assignment of the vertices of the OCPN.
 * Guarantees vertical inner segments (dummy -> dummy), yields small edge lengths,
 * and a fair balance with respect to upper and lower neighbors.
 *
 * @param {*} ocpn The layered OCPN.
 * @param {*} layering The ordered layering of the OCPN, determining the relative position of the vertices.
 * @param {*} config User defined configurations for the vertex positioning.
 */
function positionVertices(ocpn, config) {
    // Mark type 1 conflicts in the OCPN given the layering.
    markType1Conflicts(ocpn);
    const layouts = [];
    console.log("Computing the four alignments...");
    for (const verticalDir in [0, 1]) { // 0: down, 1: up
        for (const horizontalDir in [0, 1]) { // 0: left, 1: right
            // console.log(`${verticalDir == 0 ? "Down" : "Up"} - ${horizontalDir == 0 ? "Leftmost" : "Rightmost"}`);
            // Reverse the outer and inner layers depending on the directions.
            let [currentLayering, pos] = transformLayering(clone2DArray(ocpn.layout.layering), verticalDir, horizontalDir);

            // Align each vertex vertically with its median neighbor where possible.
            let [roots, aligns] = verticalAlignment(ocpn, currentLayering, pos, verticalDir == 0);

            // Determine coordinates subject to the current alignment.
            let [coords, maxCoord] = horizontalCompaction(ocpn, currentLayering, roots, aligns, pos, config);

            // If direction from right to left, flip coordinates back to original order.
            if (horizontalDir == 1) {
                for (let v in coords) {
                    coords[v] = maxCoord - coords[v];
                }
            }
            layouts.push(coords);
        }
    }
    // console.log(ocpn.layout.layering);
    // Align to assignment of smallest width (height).
    alignAssignments(layouts);
    // Set the actual coordinates to average median of aligned candidates.
    setCoordinates(ocpn, ocpn.layout.layering, layouts, config);
}

function positionVerticesToAlignmentType(ocpn, config) {
    // Mark type 1 conflicts in the OCPN given the layering.
    markType1Conflicts(ocpn);
    const layouts = [];
    var vert = [];
    var hor = [];
    switch (config.alignmentType) {
        case "downLeft":
            vert.push(0);
            hor.push(0);
            break;
        case "downRight":
            vert.push(0);
            hor.push(1);
            break;
        case "upLeft":
            vert.push(1);
            hor.push(0);
            break;
        case "upRight":
            vert.push(1);
            hor.push(1);
            break;
        default:
            vert.push(0);
            hor.push(0);
            vert.push(0);
            hor.push(1);
            vert.push(1);
            hor.push(0);
            vert.push(1);
            hor.push(1);
            break;
    }
    for (const verticalDir of vert) { // 0: down, 1: up
        for (const horizontalDir of hor) { // 0: left, 1: right
            // Reverse the outer and inner layers depending on the directions.
            let [currentLayering, pos] = transformLayering(clone2DArray(ocpn.layout.layering), verticalDir, horizontalDir);

            // Align each vertex vertically with its median neighbor where possible.
            let [roots, aligns] = verticalAlignment(ocpn, currentLayering, pos, verticalDir == 0);

            // Determine coordinates subject to the current alignment.
            let [coords, maxCoord] = horizontalCompaction(ocpn, currentLayering, roots, aligns, pos, config);

            // If direction from right to left, flip coordinates back to original order.
            if (horizontalDir == 1) {
                for (let v in coords) {
                    coords[v] = maxCoord - coords[v];
                }
            }
            layouts.push(coords);
            layouts.push(coords);
            layouts.push(coords);
            layouts.push(coords);
        }
    }
    // Set the actual coordinates to average median of aligned candidates.
    setCoordinates(ocpn, ocpn.layout.layering, layouts, config);
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
 */
function markType1Conflicts(ocpn) {
    console.log("Marking type 1 conflicts...");
    // Between layer first and second (last - 1 and last) there cannot be any type 1 conflicts.
    for (let i = 1; i < ocpn.layout.layering.length - 2; i++) {
        const layer = ocpn.layout.layering[i];
        const nextLayer = ocpn.layout.layering[i + 1];
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
                            let arcs = ocpn.layout.getArcsBetween(upperNeighbor, nextLayer[l]);
                            arcs.forEach(a => {
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
    let arc = ocpn.layout.getArcsBetween(u, v);
    return arc.length > 0 && arc[0].type1;
}

/**
 * Coordinate assignment is determined subject to a vertical algignment. 
 */
function horizontalCompaction(ocpn, layering, roots, aligns, pos, config) {
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
                placeBlock(ocpn, layering, v, x, pos, roots, sink, shift, aligns, config);
            }
        }
    }

    // Absolute coordinates.
    let xMax = 0;
    let absX = {};
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            let v = layering[i][j];
            absX[v] = x[roots[v]];
            if (shift[sink[roots[v]]] < Infinity) {
                absX[v] = absX[v] + shift[sink[roots[v]]];
            }
            xMax = Math.max(xMax, absX[v]);
        }
    }

    return [absX, xMax];
}


function placeBlock(ocpn, layering, v, x, pos, roots, sink, shift, aligns, config) {
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
                placeBlock(ocpn, layering, u, x, pos, roots, sink, shift, aligns, config); // TODO config
                // The sink is the root vertex with the smallest x coordinate.
                if (sink[v] == v) {
                    sink[v] = sink[u];
                }
                if (sink[v] != sink[u]) {
                    // Compute the seperation based on vertexSep and the type of the vertex.
                    let delta = config.vertexSep + Math.max(config.direction == "TB" ? config.transitionWidth : config.transitionHeight, config.placeRadius * 2);
                    shift[sink[u]] = Math.min(shift[sink[u]], x[v] - x[u] - delta); // TODO config
                } else {
                    let delta = config.vertexSep + Math.max(config.direction == "TB" ? config.transitionWidth : config.transitionHeight, config.placeRadius * 2);
                    // Maximum of own x and x of predecessor + minimum vertex separation.
                    x[v] = Math.max(x[v], x[u] + delta); // TODO config
                }
            }
            w = aligns[w];
        } while (w != v);
    }
}

function arraysByCoordinates(layout) {
    // For each x coordinate, get the vertices with that x coordinate.
    let coords = {};
    for (let v in layout) {
        if (coords[layout[v]] == undefined) {
            coords[layout[v]] = [];
        }
        coords[layout[v]].push(v);
    }
    // console.log(coords);
}

function alignAssignments(layouts) {
    console.log("Aligning the four layouts to the one with the smallest width (height)...");
    // console.log(layouts);
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
    const areaScaling = Math.max(layering.length / 10, 1);
    const layerHalfs = [];
    for (let i = 0; i < layering.length; i++) {
        let layerSize = 0;
        for (let j = 0; j < layering[i].length; j++) {
            const v = layering[i][j];
            let type = ocpn.layout.vertices[v].type;
            if (type == OCPNLayout.PLACE_TYPE) {
                // All nodes have the same radius.
                layerSize = config.placeRadius;
                break; // Layer either contains only places or only transitions (+ dummies for both).
            } else if (type == OCPNLayout.TRANSITION_TYPE) {
                // TODO implement custom widths based on label length.
                let curSize = config.direction == "TB" ? config.transitionHeight / 2 : config.transitionWidth / 2;
                layerSize = Math.max(layerSize, curSize);
            }
        }
        layerHalfs.push({ layer: i, size: layerSize });
        ocpn.layout.layerSizes.push({ layer: i, size: layerSize * 2 }); // TODO: to adjust the y coordinate of the lower dummy vertices to the bottom of the layer.
    }

    var curSize = config.borderPadding; // TODO: check config.direciton influence.
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            const v = layering[i][j];
            // Get the four candidate coordinates for the vertex in ascending order.
            const candidateCoords = layouts.map(layout => layout[v]).sort((a, b) => a - b);
            // Compute the average median of the four candidate coordinates.
            const medianCoord = (candidateCoords[1] + candidateCoords[2]) / 2;
            // Set the vertex coordinates.
            ocpn.layout.vertices[v].x = medianCoord + config.borderPadding;
            ocpn.layout.vertices[v].y = curSize + layerHalfs.find(l => l.layer == i).size;
        }
        curSize = curSize + layerHalfs.find(l => l.layer == i).size * 2 + (config.layerSep * areaScaling);
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
    let v = ocpn.layout.vertices[vertex];
    if (v.type === OCPNLayout.DUMMY_TYPE) {
        let upper = ocpn.layout.vertices[v.upper];
        if (upper.type === OCPNLayout.DUMMY_TYPE) {
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
    return ocpn.layout.getUpperNeighbors(vertex);
}

function getLowerNeighbors(ocpn, vertex) {
    return ocpn.layout.getLowerNeighbors(vertex);
}

export default { positionVertices, positionVerticesToAlignmentType };