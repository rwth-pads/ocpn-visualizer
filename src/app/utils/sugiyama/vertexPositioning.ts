import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNConfig from '../classes/OCPNConfig';
import OCPNLayout from '../classes/OCPNLayout';
import { clone2DArray } from '../lib/arrays';

/**
 * Heuristic algorithm for the coordinate assignment of the vertices of the OCPN.
 * Guarantees vertical inner segments (dummy -> dummy), yields small edge lengths,
 * and a fair balance with respect to upper and lower neighbors.
 */
function positionVertices(ocpn: ObjectCentricPetriNet, config: OCPNConfig) {
    if (!ocpn.layout) {
        return;
    }
    // Mark type 1 conflicts in the OCPN given the layering.
    markType1Conflicts(ocpn);
    const layouts = [];
    for (const verticalDir of [0, 1]) { // 0: down, 1: up
        for (const horizontalDir of [0, 1]) { // 0: left, 1: right
            // Reverse the outer and inner layers depending on the directions.
            let [currentLayering, pos] = transformLayering(clone2DArray(ocpn.layout.layering), verticalDir, horizontalDir);

            // Align each vertex vertically with its median neighbor where possible.
            let [roots, aligns] = verticalAlignment(ocpn, currentLayering, pos, verticalDir == 0);

            // Determine coordinates subject to the current alignment.
            let [coords, maxCoord] = horizontalCompaction(ocpn, currentLayering, roots, aligns, pos, config);

            // If direction from right to left, flip coordinates back to original order.
            if (horizontalDir == 1) {
                for (let v of Object.keys(coords)) {
                    coords[v] = maxCoord - (coords[v] ?? 0);
                }
            }
            layouts.push(coords);
        }
    }
    // Align to assignment of smallest width (height).
    alignAssignments(layouts);
    // Set the actual coordinates to average median of aligned candidates.
    setCoordinates(ocpn, ocpn.layout.layering, layouts, config);
}

function positionVerticesToAlignmentType(ocpn: ObjectCentricPetriNet, config: OCPNConfig) {
    if (!ocpn.layout) {
        return;
    }
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
                    coords[v] = maxCoord - (coords[v] ?? 0);
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
 */
function transformLayering(layering: string[][], verticalDir: number, horizontalDir: number): [string[][], { [key: string]: number }] {
    if (verticalDir == 1) {
        layering.reverse();
    }
    if (horizontalDir == 1) {
        layering.forEach(layer => layer.reverse());
    }
    var pos: { [key: string]: number } = {};
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
 */
function markType1Conflicts(ocpn: ObjectCentricPetriNet) {
    if (!ocpn.layout) {
        return;
    }
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
                            let arcs = ocpn.layout ? ocpn.layout.getArcsBetween(upperNeighbor, nextLayer[l]) : [];
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
 */
function verticalAlignment(ocpn: ObjectCentricPetriNet, layering: string[][], pos: { [key: string]: number }, down: boolean) {
    var root: { [key: string]: string } = {}; // Each vertex has a reference to the root of its block.
    var align: { [key: string]: string } = {}; // Each vertex has a reference to its lower aligned neighbor.

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
                const lowerUpperMedians = Array.from(new Set([Math.floor((neighbors.length - 1) / 2), Math.ceil((neighbors.length - 1) / 2)]));
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

function isMarked(ocpn: ObjectCentricPetriNet, u: string, v: string): boolean {
    let arc = ocpn.layout ? ocpn.layout.getArcsBetween(u, v) : [];
    return arc.length > 0 && arc[0].type1;
}

/**
 * Coordinate assignment is determined subject to a vertical algignment. 
 */
function horizontalCompaction(
    ocpn: ObjectCentricPetriNet,
    layering: string[][],
    roots: { [key: string]: string },
    aligns: { [key: string]: string },
    pos: { [key: string]: number },
    config: OCPNConfig
): [{ [key: string]: number | undefined }, number] {
    const x: { [key: string]: number | undefined } = {};
    const sink: { [key: string]: string } = {};
    const shift: { [key: string]: number } = {};

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
    let xMax: number = 0;
    let absX: { [key: string]: number | undefined } = {};
    for (let i = 0; i < layering.length; i++) {
        for (let j = 0; j < layering[i].length; j++) {
            let v = layering[i][j];
            absX[v] = x[roots[v]];
            if (shift[sink[roots[v]]] < Infinity && absX[v] != undefined) {
                absX[v] = absX[v] + shift[sink[roots[v]]];
            }
            xMax = Math.max(xMax, (absX[v] ?? 0));
        }
    }
    return [absX, xMax];
}


function placeBlock(
    ocpn: ObjectCentricPetriNet,
    layering: string[][],
    v: string,
    x: { [key: string]: number | undefined },
    pos: { [key: string]: number },
    roots: { [key: string]: string },
    sink: { [key: string]: string },
    shift: { [key: string]: number },
    aligns: { [key: string]: string },
    config: OCPNConfig
) {
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
                    let transitionWidthMax = config.transitionWidth < config.silentTransitionWidth ? config.silentTransitionWidth : config.transitionWidth;
                    let delta = config.vertexSep + Math.max(config.direction == "TB" ? transitionWidthMax : config.transitionHeight, config.placeRadius * 2);
                    shift[sink[u]] = Math.min(shift[sink[u]], x[v] - (x[u] ?? 0) - delta);
                } else {
                    let transitionWidthMax = config.transitionWidth < config.silentTransitionWidth ? config.silentTransitionWidth : config.transitionWidth;
                    let delta = config.vertexSep + Math.max(config.direction == "TB" ? transitionWidthMax : config.transitionHeight, config.placeRadius * 2);
                    // Maximum of own x and x of predecessor + minimum vertex separation.
                    x[v] = Math.max(x[v], (x[u] ?? 0) + delta);
                }
            }
            w = aligns[w];
        } while (w != v);
    }
}

function alignAssignments(layouts: { [key: string]: number | undefined }[]): void {
    // Determine minimum and maximum coordinates for each layout.
    const minMax = layouts.map(coords => {
        const values = Object.values(coords).filter((v): v is number => v !== undefined);
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
            if (layout[v] !== undefined) layout[v] += shift;
        }
    });
}
/**
 * Sets the actual coordinates of the vertices based on the average median of the aligned candidates.
 */
function setCoordinates(ocpn: ObjectCentricPetriNet, layering: string[][], layouts: { [key: string]: number | undefined }[], config: OCPNConfig) {
    if (!ocpn.layout) {
        return;
    }
    // 
    const layerHalfs = [];
    for (let i = 0; i < layering.length; i++) {
        let halfLayerSize = 0;
        for (let j = 0; j < layering[i].length; j++) {
            const v = layering[i][j];
            let type = ocpn.layout.vertices[v].type;
            if (type == OCPNLayout.PLACE_TYPE) {
                // All nodes have the same radius.
                halfLayerSize = config.placeRadius;
                break; // Layer either contains only places or only transitions (+ dummies for both).
            } else if (type == OCPNLayout.TRANSITION_TYPE) {
                // Compute the layer size based on the transition width or height.
                if (config.direction == "TB") {
                    // Depends on the transition height.
                    halfLayerSize = Math.max(halfLayerSize, config.transitionHeight);
                } else {
                    let thisVertexHalfSize = 0;
                    if (config.direction == "TB") {
                        thisVertexHalfSize = config.transitionHeight / 2;
                    } else {
                        // Check whether the transition is silent, because silent transitions can have a different width.
                        let silent = ocpn.layout.vertices[v].silent;
                        thisVertexHalfSize = silent ? config.silentTransitionWidth / 2 : config.transitionWidth / 2;
                    }
                    halfLayerSize = Math.max(halfLayerSize, thisVertexHalfSize);
                }
            }
        }
        layerHalfs.push({ layer: i, size: halfLayerSize });
        ocpn.layout.layerSizes.push({ layer: i, size: halfLayerSize * 2 });
    }

    var curSize = config.borderPadding;
    // Iterate over the all layers.
    for (let i = 0; i < layering.length; i++) {
        // Get the size of half the current layer.
        var layerHalf = layerHalfs.find(l => l.layer == i);
        if (!layerHalf) layerHalf = { layer: i, size: 0 };
        // Set the coordinates for each vertex in the current layer to the same x (left-right) or y (top-bottom) coordinates.
        // Set the previously computed individual y (left-right) or x (top-bottom) coordinates.
        for (let j = 0; j < layering[i].length; j++) {
            const v = layering[i][j];
            // Get the four candidate coordinates for the vertex in ascending order.
            const candidateCoords = layouts.map(layout => layout[v]).filter((coord): coord is number => coord !== undefined).sort((a, b) => a - b);
            // Compute the average median of the four candidate coordinates.
            const medianCoord = (candidateCoords[1] + candidateCoords[2]) / 2;
            // Differentiate between top-bottom and left-right direction.
            let thisX = config.direction == "TB" ? medianCoord + config.borderPadding : curSize + layerHalf.size;
            let thisY = config.direction == "TB" ? curSize + layerHalf.size : medianCoord + config.borderPadding;
            // Adjust the outer dummy vertices to the side of their respective layers.
            if (ocpn.layout.vertices[v].type == OCPNLayout.DUMMY_TYPE) {
                // Check whether the vertex is an outer dummy.
                let upperNeighbor = ocpn.layout.vertices[v].upper;
                let lowerNeighbor = ocpn.layout.vertices[v].lower;
                if (upperNeighbor && ocpn.layout.vertices[upperNeighbor].type != OCPNLayout.DUMMY_TYPE) {
                    // Dummy is an outer dummy and must be adjusted to the top (left) of their layer.
                    if (config.direction == "TB") {
                        thisY = thisY - layerHalf.size;
                    } else {
                        thisX = thisX - layerHalf.size;
                    }
                } else if (lowerNeighbor && ocpn.layout.vertices[lowerNeighbor].type != OCPNLayout.DUMMY_TYPE) {
                    // Dummy is an outer dummy and must be adjusted to the bottom (right) of their layer.
                    if (config.direction == "TB") {
                        thisY = thisY + layerHalf.size;
                    } else {
                        thisX = thisX + layerHalf.size;
                    }
                }
            }
            // Set the vertex coordinates.
            ocpn.layout.vertices[v].x = thisX;
            ocpn.layout.vertices[v].y = thisY;
        }
        curSize = curSize + layerHalf.size * 2 + (config.layerSep);
    }
}

/**
 * Checks whether the vertex is incident to an inner segment.
 * A vertex is incident to an inner segment if it is a dummy and its upper neighbor is a dummy.
 */
function isIncidentToInnerSegment(ocpn: ObjectCentricPetriNet, vertex: string) {
    if (ocpn.layout) {
        let v = ocpn.layout.vertices[vertex];
        if (v.type === OCPNLayout.DUMMY_TYPE) {
            if (v.upper) {
                let upper = ocpn.layout.vertices[v.upper];
                if (upper.type === OCPNLayout.DUMMY_TYPE) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getUpperNeighbors(ocpn: ObjectCentricPetriNet, vertex: string) {
    return ocpn.layout ? ocpn.layout.getUpperNeighbors(vertex) : [];
}

function getLowerNeighbors(ocpn: ObjectCentricPetriNet, vertex: string) {
    return ocpn.layout ? ocpn.layout.getLowerNeighbors(vertex) : [];
}

const positioning = {
    positionVertices,
    positionVerticesToAlignmentType
};

export default positioning;