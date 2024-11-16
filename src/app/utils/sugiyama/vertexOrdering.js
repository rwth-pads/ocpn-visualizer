// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

/**
 * Deep clones a 2D array (array of arrays).
 * 
 * @param {Array<Array<String>>} arr The array to clone.
 * @returns The cloned array.
 */
function clone2DArray(arr) {
    return arr.map(innerArr => innerArr.slice());
}

/**
 * Compares two 2D arrays for deep equality.
 * 
 * @param {Array<Array<String>>} arr1 - The first 2D array.
 * @param {Array<Array<String>>} arr2 - The second 2D array.
 * @returns {boolean} - True if the arrays are equal, false otherwise.
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].length !== arr2[i].length) return false;
        for (let j = 0; j < arr1[i].length; j++) {
            if (arr1[i][j] !== arr2[i][j]) return false;
        }
    }
    return true;
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} layering 
 * @param {*} config 
 * @returns 
 */
function orderVertices(ocpn, layering, config) {
    // TODO: Adjust the initial order within the layering according to the users object centrality.
    // adjustLayeringOrderByObjectCentrality(ocpn, layering, config);
    // Implementation of the barycenter method for vertex ordering.
    var baryOrder = upDownBarycenterBilayerSweep(ocpn, layering, config);
    return baryOrder;
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {Array<Array<String>>} layering 
 * @param {*} config 
 * @returns 
 */
function upDownBarycenterBilayerSweep(ocpn, layering, config) {
    const MAXITERATIONS = 4;
    const OBJECT_ATTRACTION = 0;

    // Computes the intitial score of the order.
    var bestScore = computeLayeringScore(ocpn, layering, OBJECT_ATTRACTION);
    // Initialize the iteration counter that counts the iterations where no improvement was made.
    var noImprovementCounter = 0;
    var best = clone2DArray(layering);
    // List of computed layerings to check for reocurring layerings.
    var computedLayerings = [];
    computedLayerings.push(clone2DArray(layering));
    // Perform the barycenter method going up and down the layers.
    while (true) {
        layering = singleUpDownSweep(ocpn, layering, config); // Phase 1
        layering = adjustEqualBarycenters(ocpn, layering) // Phase 2
        var currentScore = computeLayeringScore(ocpn, layering, OBJECT_ATTRACTION);
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
        if (noImprovementCounter >= MAXITERATIONS) {
            console.log("Terminating barycenter sweep due to no improvement!");
            break;
        } else if (reocurringLayering(layering, computedLayerings)) {
            console.log("Terminating barycenter sweep due to reocurring layering!");
            break;
        } else {
            // Add the current layering to the list of computed layerings.
            computedLayerings.push(clone2DArray(layering));
        }
    }
    return [bestScore, best];
}

/**
 * Performs a single up-down sweep of the layers within the layering.
 *
 * @param {ObjectCentricPetriNet} ocpn The OCPN. 
 * @param {*} layering The layering returned by the layer assignment step.
 * @param {*} config User defined configurations.
 * @returns The updated layering.
 */
function singleUpDownSweep(ocpn, layering, config) {
    // Go down and up the layers and adjust the vertex order.
    for (let dir = 0; dir < 2; dir++) {
        let start = dir == 0 ? 1 : layering.length - 2;
        for (let layer = start;
            dir == 0 ? layer < layering.length : layer >= 0;
            dir == 0 ? layer++ : layer--) {
            // console.log(`Fixed ${layer + (dir == 0 ? -1 : 1)}, order ${layer}, ${dir == 0 ? 'down' : 'up'}`);
            // Adjusts only the layering[layer] while keeping the other layers fixed.
            layering = modifiedBarycenterOrder(ocpn, layering, layer, dir == 0, config);
            // console.log("Layering: ", layering);
        }
    }
    return layering;
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} layering 
 * @returns 
 */
function adjustEqualBarycenters(ocpn, layering) {
    // Swaps vertices within layers that have the same barycenter values.
    return layering;
}

/**
 * TODO: change to modified barycenter instead of normal barycenter.
 * @param {ObjectCentricPetriNet} ocpn The OCPN.
 * @param {*} layering The current layering.
 * @param {*} layer The layer that is currently being adjusted.
 * @param {boolean} down Determines the direction of the sweep.
 */
function modifiedBarycenterOrder(ocpn, layering, layer, down) {
    // Compute the barycenter values for the current layer.
    var barycenters = computeModifiedBarycenters(ocpn, layering, layer, down);
    // Sort the vertices in the layer according to the barycenter values.
    // console.log("\tBarycenters: ", barycenters);
    // console.log("Layer before: ", layering[layer]);
    // The greater the barycenter value the more to the right the vertex is placed.
    // Equal barycenter values are sorted by the original order.
    layering[layer].sort((a, b) => barycenters[a] - barycenters[b]);
    // console.log("\tSorted Layer: ", layering[layer]);
    return layering;
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} layering 
 * @param {*} layer 
 * @param {*} down 
 */
function computeModifiedBarycenters(ocpn, layering, layer, down) {
    var barycenters = {};
    var vertices = layering[layer];
    for (let i = 0; i < vertices.length; i++) {
        var vName = vertices[i];
        var v = ocpn.findElementByName(vName);
        if (v instanceof ObjectCentricPetriNet.Place) {
            barycenters[vName] = placeBarycenter(v, layering, layer, down);
        } else if (v instanceof ObjectCentricPetriNet.Transition) {
            barycenters[vName] = transitionBarycenter(v, layering, layer, down);
        } else if (v instanceof ObjectCentricPetriNet.Dummy) {
            barycenters[vName] = dummyBarycenter(v, layering, layer, down);
        }
    }
    return barycenters;
}

/**
 * 
 * @param {ObjectCentricPetriNet.Place} place 
 * @param {*} layering 
 * @param {*} layer 
 * @param {*} down 
 * @returns 
 */
function placeBarycenter(place, layering, layer, down) {
    var fixedLayer = down ? layer - 1 : layer + 1;
    // Only consider the neighbors that are in the fixed layer.
    var neighbors = place.inArcs.map(arc => arc.source)
        .concat(place.outArcs.map(arc => arc.target))
        .filter(v => v.layer == fixedLayer);

    // TODO: get the average of the indeces of places of the same object type in above / below the fixed layer.

    // If there are no neighbors in the fixed layer, return the current index + 1.
    if (neighbors.length == 0) {
        return layering[layer].indexOf(place.name) + 1; // TODO: add (1- oa) ... + oa * ...
    }

    // Compute the barycenter value.
    var barycenter = 0;
    for (let i = 0; i < neighbors.length; i++) {
        barycenter += layering[fixedLayer].indexOf(neighbors[i].name) + 1;
    }

    // console.log(`P: ${place.name} bary: ${barycenter / neighbors.length}`);
    return barycenter / neighbors.length; // TODO: add (1- oa) ... + oa * ...
}

/**
 * Computes the (TODO: modified) barycenter value for the given transition. 
 *
 * @param {ObjectCentricPetriNet.Transition} transition The transition in question.
 * @param {*} layering 
 * @param {*} layer 
 * @param {*} down Determines the direction of the sweep.
 * @returns The computed barycenter value.
 */
function transitionBarycenter(transition, layering, layer, down) {
    // For transitions we only need to consider the incoming arcs (down) or the outgoing arcs (up).
    // TODO: Consider reversed arcs.
    var fixedLayer = down ? layer - 1 : layer + 1;
    // Only consider the neighbors that are in the fixed layer.
    var neighbors = transition.inArcs.map(arc => arc.source)
        .concat(transition.outArcs.map(arc => arc.target))
        .filter(v => v.layer == fixedLayer);

    // If there are no neighbors in the fixed layer, return the current index + 1.
    if (neighbors.length == 0) {
        return layering[layer].indexOf(transition.name) + 1;
    }

    // Compute the barycenter value.
    var barycenter = 0;
    for (let i = 0; i < neighbors.length; i++) {
        // TODO: object weight -> different weights for different object types.
        barycenter += layering[fixedLayer].indexOf(neighbors[i].name) + 1;
    }

    // console.log(`T: ${transition.name} bary: ${barycenter / neighbors.length}`);
    return barycenter / neighbors.length;
}

/**
 * 
 * @param {ObjectCentricPetriNet.Dummy} dummy 
 * @param {*} layering 
 * @param {*} layer 
 * @param {*} down 
 * @returns 
 */
function dummyBarycenter(dummy, layering, layer, down) {
    // For dummies we return the same value as the source or target's index.
    var fixedLayer = down ? layer - 1 : layer + 1;
    var neighbor = down ? dummy.target : dummy.source;
    var index = layering[fixedLayer].indexOf(neighbor.name) + 1;
    // console.log(`D: ${dummy.name} neighbor ${neighbor.name} index ${index}`);
    return index;
}

/**
 * For now just computes the crossing count.
 * TODO: implement a combination of the crossing count, the object attraction, and additional constraints. 
 * @param {*} ocpn The object centric petri net.
 * @param {*} layering The current layering of the OCPN.
 * @param {Number} oa The object attraction value [0,1] 
 */
function computeLayeringScore(ocpn, layering, oa) {
    // Compute the crossing count.
    var crossingCount = countCrossings(ocpn, layering);
    // Compute value that measures the quality of object attraction in the current layering.
    var objectAttractionCount = measureObjectAttractionCount(ocpn, layering);
    // Return combined score.  oa is always 0 currently -> only the crossing count is considered.
    return (1 - oa) * crossingCount + oa * objectAttractionCount; // TODO: check if this is the correct formula.
}

/**
 * Computes the crossing count given the OCPN and the layering.
 * The crossing count is a value that measures the number of crossings between all layers.
 * 
 * The lower the value the "better" the layering.
 * @param {*} ocpn 
 * @param {*} layering 
 */
function countCrossings(ocpn, layering) {
    var crossings = 0;

    // Compute the crossings between all layers.
    // TODO
    return crossings;
}

/**
 * Computes the object attraction count given the OCPN and the layering.
 * The object attraction count is a value that measures the how close
 * places of the same object type are together in the layering.
 * 
 * The lower the value the "better" the object attraction.
 * @param {*} ocpn 
 * @param {*} layering 
 */
function measureObjectAttractionCount(ocpn, layering) {
    // TODO
    return 0;
}

/**
 * Checks if the current layering has already been computed.
 *
 * @param {*} currentLayering 
 * @param {*} computedLayerings 
 * @returns Returns true if the current layering has already been computed.
 */
function reocurringLayering(currentLayering, computedLayerings) {
    // Check if the current layering has already been computed.
    for (let i = 0; i < computedLayerings.length; i++) {
        if (arraysEqual(currentLayering, computedLayerings[i])) {
            return true;
        }
    }
    return false;
}

module.exports = orderVertices;
// export default orderVertices;

/**
 * Barycenter method (BC method) as described in the paper:
 * "Methods for Visual Understanding of Hierarchical System Structures" Sugiyama et al. (1981)
 * 
 * Algorithm consists of two phases:
 *      Phase 1: barycenter ordering of rows and columns is repeated in turn. (equal barycenters are preserved)
 *      Phase 2: reordering of rows and columns with equal barycenters just after execution of Phase 1 calle 'reversion'
 *          Phase 2 uses Phase 1 as a subalgorithm
 * 
 * Phase 1:
 *      1. Compute initial ordering M* = M0 and the crossing count K* = K(M0)
 *      2. M1 = barycentric ordering of rows on M0
 *      3. if K(M1) < K* then M* = M1 and K* = K(M1)
 *      4. M2 = barycentric ordering of columns on M1
 *      5. if K(M2) < K* then M* = M2 and K* = K(M2)
 *      6. if M0 == M2 || maxiterations in Phase 1 reached goto 7. else goto 2.
 * 
 * Phase 2:
 *      7. M3 = row reversion of M2 -> equal barycenters reordered ([1,2,3,4] -> [4,3,2,1])
 *      8. if resulting column barycenters are not ordered in increasing order goto 11. (M0 := M3) else goto 9.
 *      9. M4 = column reversion of M3 -> equal barycenters reordered ([a,b,c,d] -> [a,c,b,d])
 *      10. if resulting row barycenters are not ordered in increasing order goto 11 . (M0 := M4) else TERMINATE
 *      11. goto 2. if not maxiterations reached else TERMINATE
 */
