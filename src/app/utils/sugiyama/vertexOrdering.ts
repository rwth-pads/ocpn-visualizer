import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNConfig from '../classes/OCPNConfig';
import OCPNLayout from '../classes/OCPNLayout';
import { clone2DArray, arraysEqual } from '../lib/arrays';

interface DoubleBarycenter {
    down: number;
    up: number;
}

/**
 * Orders the vertices within the layers of the OCPN according to the barycenter method.
 */
function orderVertices(ocpn: ObjectCentricPetriNet, config: OCPNConfig): void {
    if (!ocpn.layout) {
        return;
    }
    // Adjust the initial order within the layering according to the users object centrality.
    if (config.objectCentrality !== undefined) {
        adjustLayeringOrderByObjectCentrality(ocpn, config);
    }

    // Implementation of the barycenter method for vertex ordering.
    upDownBarycenterBilayerSweep(ocpn, config);

    // Set the positions of the vertices in the layering according to the computed order.
    for (let i = 0; i < ocpn.layout.layering.length; i++) {
        for (let j = 0; j < ocpn.layout.layering[i].length; j++) {
            let v = ocpn.layout.layering[i][j];
            ocpn.layout.vertices[v].pos = j;
        }
    }
}

/**
 * Adjusts the initial order of the vertices within the layering according to the user defined object centrality. 
 */
function adjustLayeringOrderByObjectCentrality(ocpn: ObjectCentricPetriNet, config: OCPNConfig): void {
    if (!ocpn.layout || !config.objectCentrality) {
        return;
    }

    const objectCentrality = config.objectCentrality;
    // Iterate over the layers of the OCPN.
    for (let i = 0; i < ocpn.layout.layering.length; i++) {
        let j = 0;
        let layerType = OCPNLayout.DUMMY_TYPE;
        while (j < ocpn.layout.layering[i].length) {
            // Check whether the current layer is a 'place' or 'transition' layer.
            let type = ocpn.layout.vertices[ocpn.layout.layering[i][j]].type;
            if (type === OCPNLayout.PLACE_TYPE) {
                layerType = OCPNLayout.PLACE_TYPE;
                break;
            } else if (type === OCPNLayout.TRANSITION_TYPE) {
                layerType = OCPNLayout.TRANSITION_TYPE;
                break;
            } else {
                j++;
            }
        }
        if (layerType === OCPNLayout.PLACE_TYPE) {
            // Sort the places according to the user defined object centrality.
            // Example: objectCentrality = { "A": 0, "B": 2, "C": 1 } -> [placeA, placeC, placeB]
            ocpn.layout.layering[i].sort((a, b) =>
                ((ocpn.layout && ocpn.layout.vertices[a].objectType !== undefined ? objectCentrality[ocpn.layout.vertices[a].objectType] : 0) ?? 0)
                - ((ocpn.layout && ocpn.layout.vertices[b].objectType !== undefined ? objectCentrality[ocpn.layout.vertices[b].objectType] : 0) ?? 0));
        }
    }
}

function upDownBarycenterBilayerSweep(ocpn: ObjectCentricPetriNet, config: OCPNConfig): void {
    if (!ocpn.layout) {
        return;
    }
    // Computes the intitial score of the order.
    var bestScore = computeLayeringScore(ocpn, ocpn.layout.layering, config);
    // Initialize the iteration counter that counts the iterations where no improvement was made.
    var noImprovementCounter = 0;
    var best = clone2DArray(ocpn.layout.layering);
    var layering = clone2DArray(ocpn.layout.layering);
    // List of computed layerings to check for reocurring layerings.
    var computedLayerings = [];
    computedLayerings.push(clone2DArray(layering));
    // Perform the barycenter method going up and down the layers.
    var sweepCounter = 1;
    while (true) {
        layering = singleUpDownSweep(ocpn, layering, config);
        var currentScore = computeLayeringScore(ocpn, layering, config);
        // Check if the vertex order has improved.
        if (currentScore < bestScore) {
            bestScore = currentScore;
            best = clone2DArray(layering);
            noImprovementCounter = 0;
        } else {
            // Increment the counter if no improvement was made.
            noImprovementCounter++;
        }
        // Check the termination conditions.
        if (noImprovementCounter >= config.maxBarycenterIterations) {
            console.log(`Terminating barycenter sweep due to no improvements! (Iteration: ${sweepCounter})`);
            break;
        } else if (reocurringLayering(layering, computedLayerings)) {
            console.log(`Terminating barycenter sweep due to reocurring layering! (Iteration: ${sweepCounter})`);
            break;
        } else {
            // Add the current layering to the list of computed layerings.
            computedLayerings.push(clone2DArray(layering));
        }
        sweepCounter++;
    }
    ocpn.layout.layering = best;
}

/**
 * Performs a single up-down sweep of the layers within the layering.
 */
function singleUpDownSweep(ocpn: ObjectCentricPetriNet, layering: string[][], config: OCPNConfig): string[][] {
    var doubleBary = new Map<string, DoubleBarycenter>();
    // Go down and up the layers and adjust the vertex order.
    for (let dir = 0; dir < 2; dir++) {
        let start = dir == 0 ? 1 : layering.length - 2;
        for (let layer = start;
            dir == 0 ? layer < layering.length : layer >= 0;
            dir == 0 ? layer++ : layer--) {
            // Adjusts only the layering[layer] while keeping the other layers fixed.
            layering[layer] = modifiedBarycenterOrder(ocpn, layering, layer, dir == 0, doubleBary, config);
        }
    }

    // // Combine the barycenter values of the down and up sweep to filter out bias.
    // layering = combineUpDownBarycenters(layering, doubleBary);
    // console.log("Layering after combining barycenters: ", layering);
    return layering;
}

function combineUpDownBarycenters(layering: string[][], doubleBary: Map<string, DoubleBarycenter>): string[][] {
    // Iterate over the layers and sort based on the combined barycenter values.
    for (let l = 0; l < layering.length; l++) {
        layering[l].sort((a, b) => {
            let dbA = doubleBary.get(a);
            let dbB = doubleBary.get(b);
            if (dbA && dbB) {
                return (dbA.down + dbA.up) - (dbB.down + dbB.up);
            } else {
                return 0;
            }
        });
    }
    return layering;
}

function modifiedBarycenterOrder(ocpn: ObjectCentricPetriNet, layering: string[][], layer: number, down: boolean, doubleBary: Map<string, DoubleBarycenter>, config: OCPNConfig): string[] {
    // Compute the barycenter values for the current layer.
    var barycenters = computeModifiedBarycenters(ocpn, layering, layer, down, config);
    var adjustedBarycenters = adjustNoNeighborsBarycenters(layering, layer, barycenters);
    setDirectionBarycenters(layering, layer, down, adjustedBarycenters, doubleBary);
    // Sort the vertices in the layer according to the barycenter values.
    // The greater the barycenter value the more to the right the vertex is placed.
    // Equal barycenter values are sorted by the original order.
    let orderedLayer = layering[layer].sort((a, b) => {
        const diff = adjustedBarycenters[a] - adjustedBarycenters[b];
        return diff !== 0 ? diff : layering[layer].indexOf(a) - layering[layer].indexOf(b);
    });
    return orderedLayer;
}

/**
 * Sets the barycenter values of the vertices in the layer according to the direction of the sweep.
 * Used to later combine the barycenter values of the down and up sweep.
 * Counters the effect of vertices with no neighbors in the fixed layer.
 */
function setDirectionBarycenters(layering: string[][], layer: number, down: boolean, barys: { [key: string]: number }, doubleBarys: Map<string, DoubleBarycenter>): void {
    for (let i = 0; i < layering[layer].length; i++) {
        let v = layering[layer][i];
        if (down) {
            // Down sweep always occurs before up sweep.
            doubleBarys.set(v, { down: barys[v], up: -1 });
        } else {
            // Update the up value, while keepin the down value.
            let db = doubleBarys.get(v);
            if (db) {
                db.up = barys[v];
                doubleBarys.set(v, db);
            }
        }
    }
}

function adjustNoNeighborsBarycenters(layering: string[][], layer: number, barycenters: { [key: string]: number }): { [key: string]: number } {
    const offset = 0.001;
    // Vertices with no neighbors have been assigned a barycenter value of -1.
    // Assign the barycenter value of its next left neighbor with a valid barycenter value or 0 if none.
    var adjustedBarycenters: { [key: string]: number } = {};
    for (let i = 0; i < layering[layer].length; i++) {
        let v = layering[layer][i];
        if (barycenters[v] == -1) {
            let leftNeighborBary = i == 0 ? 0 : barycenters[layering[layer][i - 1]] + offset;
            adjustedBarycenters[v] = leftNeighborBary;
        } else {
            adjustedBarycenters[v] = barycenters[v];
        }
    }
    return adjustedBarycenters;
}

function computeModifiedBarycenters(ocpn: ObjectCentricPetriNet, layering: string[][], layer: number, down: boolean, config: OCPNConfig): { [key: string]: number } {
    var barycenters: { [key: string]: number } = {};
    var vertices = layering[layer];
    for (let i = 0; i < vertices.length; i++) {
        var v = vertices[i];
        if (ocpn.layout && ocpn.layout.vertices[v].type === OCPNLayout.PLACE_TYPE) {
            barycenters[v] = placeBarycenter(ocpn, v, layering, layer, down, config);
        } else if (ocpn.layout && ocpn.layout.vertices[v].type === OCPNLayout.TRANSITION_TYPE) {
            barycenters[v] = transitionBarycenter(ocpn, v, layering, layer, down);
        } else if (ocpn.layout && ocpn.layout.vertices[v].type === OCPNLayout.DUMMY_TYPE) {
            barycenters[v] = dummyBarycenter(ocpn, v, layering, layer, down);
        }
    }
    return barycenters;
}

function placeBarycenter(ocpn: ObjectCentricPetriNet, place: string, layering: string[][], layer: number, down: boolean, config: OCPNConfig): number {
    var barycenter = 0;
    var objectBarycenter = 0;
    // Get the neighbors of the place in the upper (dir = down) or lower (dir = up) layer.
    var neighbors = ocpn.layout ? (ocpn.layout.getAllArcsBetweenRanks(down ? layer - 1 : layer)
        .filter(arc => down ? arc.target === place : arc.source === place)
        .map(arc => down ? arc.source : arc.target)) : [];

    // Compute the barycenter value.
    for (let i = 0; i < neighbors.length; i++) {
        barycenter += layering[down ? layer - 1 : layer + 1].indexOf(neighbors[i]) + 1;
    }
    // Get the average index of all places of the same object type in the layers above (down) or below (up).
    var objectNeighbors: number[] = [];
    for (let i = config.objectAttractionRangeMin; i <= config.objectAttractionRangeMax; i++) {
        let layerIndex = down ? layer - 2 * i : layer + 2 * i;
        if (layerIndex < 0 || layerIndex >= layering.length) {
            break;
        } else {
            let ons = layering[layerIndex].filter(v => ocpn.layout && ocpn.layout.vertices[v].objectType == ocpn.layout.vertices[place].objectType);
            objectNeighbors = objectNeighbors.concat(ons.map(on => layering[layerIndex].indexOf(on) + 1));
        }
    }
    objectBarycenter = objectNeighbors.length > 0 ? objectNeighbors.reduce((a, b) => a + b) / objectNeighbors.length : 0;

    // If there are no neighbors in the fixed layer, return the current object barycenter.
    if (neighbors.length == 0) {
        // objectBarycenter = objectBarycenter == 0 ? -1 : objectBarycenter;
        // return objectBarycenter;
        return -1;
    }
    barycenter = barycenter / neighbors.length;
    // If there are no places of the same object type in the layers above or below, return the computed barycenter.
    if (objectBarycenter == 0) {
        return barycenter;
    }
    // Return the weighted average of the barycenter and the object barycenter.
    return (1 - config.objectAttraction) * barycenter + config.objectAttraction * objectBarycenter;
}

function transitionBarycenter(ocpn: ObjectCentricPetriNet, transition: string, layering: string[][], layer: number, down: boolean): number {
    // For transitions we only need to regard adjacent vertices (places or dummies) in the fixed layer.
    var fixedLayer = down ? layer - 1 : layer + 1;
    // Only consider the neighbors that are in the fixed layer.
    var neighbors = ocpn.layout ? (ocpn.layout.getAllArcsBetweenRanks(down ? layer - 1 : layer)
        .filter(arc => down ? arc.target === transition : arc.source === transition).map(arc => down ? arc.source : arc.target))
        : [];

    // If there are no neighbors in the fixed layer, return the current index + 1.
    if (neighbors.length == 0) {
        return -1;
        // return undefined; // Use the barycenter of its left neighbor (or 0 if none).
    }

    // Compute the barycenter value.
    var barycenter = 0;
    for (let i = 0; i < neighbors.length; i++) {
        barycenter += layering[fixedLayer].indexOf(neighbors[i]) + 1;
    }

    return barycenter / neighbors.length;
}

function dummyBarycenter(ocpn: ObjectCentricPetriNet, dummy: string, layering: string[][], layer: number, down: boolean): number {
    if (!ocpn.layout) {
        return -1;
    }
    // For dummies we return the same value as the source or target's index.
    var d = ocpn.layout.vertices[dummy];
    var neighbor = down ? (d.upper ?? '') : (d.lower ?? '');
    var index = layering[down ? layer - 1 : layer + 1].indexOf(neighbor) + 1;
    // if dummy is outer dummy, and direction is up, use previously computed barycenter as well.
    if (!down && ocpn.layout.vertices[(d.lower ?? '')].type !== OCPNLayout.DUMMY_TYPE) {
        index = (index + layering[layer - 1].indexOf((d.upper ?? '')) + 1) / 2;
    }
    return index;
}

function computeLayeringScore(ocpn: ObjectCentricPetriNet, layering: string[][], config: OCPNConfig): number {
    // Compute the crossing count.
    var crossingCount = countCrossings(ocpn, layering);
    // Compute value that measures the quality of object attraction in the current layering.
    var objectAttractionCount = measureObjectAttractionCount(ocpn, layering, config);
    // Return combined score.
    return crossingCount + objectAttractionCount;
}

function countCrossings(ocpn: ObjectCentricPetriNet, layering: string[][]): number {
    var crossings = 0;
    // Compute the crossings between all layers.
    for (let l = 0; l < layering.length - 1; l++) {
        // Get all arcs between the current and the next layer.
        var arcs = ocpn.layout ? ocpn.layout.getAllArcsBetweenRanks(l) : [];

        var currLayer = layering[l];
        var nextLayer = layering[l + 1];
        // Compute the crossings between the current and the next layer.
        for (let i = 0; i < arcs.length - 1; i++) {
            for (let j = i + 1; j < arcs.length; j++) {
                // Check for each pair of arcs between the current and next layer if they cross.
                let arc1 = arcs[i];
                let arc2 = arcs[j];
                // Get the indices of the adjacent vertices in the current and next layer.
                let upper1Index = currLayer.indexOf(arc1.source);
                let lower1Index = nextLayer.indexOf(arc1.target);
                let upper2Index = currLayer.indexOf(arc2.source);
                let lower2Index = nextLayer.indexOf(arc2.target);

                // Check if the arcs cross.
                if (upper1Index > upper2Index && lower1Index < lower2Index ||
                    upper1Index < upper2Index && lower1Index > lower2Index) {
                    crossings++;
                }
            }
        }
    }
    return crossings;
}

function measureObjectAttractionCount(ocpn: ObjectCentricPetriNet, layering: string[][], config: OCPNConfig): number {
    if (!ocpn.layout) {
        return 0;
    }
    // For each object type compute the average deviation from the average index.
    var objectDeviation = 0;
    ocpn.layout.objectTypes.forEach(objectType => {
        var objectPlaces: { name: string, index: number }[] = [];
        // Get the indices of the places of the current object type in each layer.
        for (let l = 0; l < layering.length; l++) {
            let places = layering[l].filter(v => ocpn.layout && ocpn.layout.vertices[v].objectType == objectType);
            objectPlaces = objectPlaces.concat(places.map(place => ({ name: place, index: layering[l].indexOf(place) + 1 })));
        }
        // Compute the average index of the places of the current object type.
        var avgIndex = objectPlaces.reduce((a, b) => a + b.index, 0) / objectPlaces.length;
        for (let i = 0; i < objectPlaces.length; i++) {
            objectDeviation += Math.abs(objectPlaces[i].index - avgIndex);
        }
    });
    return objectDeviation * config.objectAttraction;
}

function reocurringLayering(currentLayering: string[][], computedLayerings: string[][][]): boolean {
    // Check if the current layering has already been computed.
    for (let i = 0; i < computedLayerings.length; i++) {
        if (arraysEqual(currentLayering, computedLayerings[i])) {
            return true;
        }
    }
    return false;
}

export default orderVertices;