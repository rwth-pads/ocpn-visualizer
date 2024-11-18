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
    // if (config.objectCentralitySet) {
    // adjustLayeringOrderByObjectCentrality(ocpn, layering, config);
    // }
    // Implementation of the barycenter method for vertex ordering.
    var baryOrder = upDownBarycenterBilayerSweep(ocpn, layering, config);
    return baryOrder;
}

/**
 * Adjusts the initial order of the vertices within the layering according to the user defined object centrality.
 * 
 * @param {*} ocpn 
 * @param {*} layering 
 * @param {*} config 
 */
function adjustLayeringOrderByObjectCentrality(ocpn, layering, config) {
    console.log("Adjusting layering order by object centrality...");
    // TODO
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
    const OBJECT_ATTRACTION = 0.2;
    const OBJECT_ATTRACTION_RANGE_MIN = 1; // The layers taken into account when computing the place barycenters.
    const OBJECT_ATTRACTION_RANGE_MAX = 2; // The layers taken into account when computing the place barycenters.
    const testConfig = {
        objectAttraction: OBJECT_ATTRACTION,
        objectAttractionRangeMin: OBJECT_ATTRACTION_RANGE_MIN,
        objectAttractionRangeMax: OBJECT_ATTRACTION_RANGE_MAX
    }
    // Computes the intitial score of the order.
    var bestScore = computeLayeringScore(ocpn, layering, testConfig);
    // Initialize the iteration counter that counts the iterations where no improvement was made.
    var noImprovementCounter = 0;
    var best = clone2DArray(layering);
    // List of computed layerings to check for reocurring layerings.
    var computedLayerings = [];
    computedLayerings.push(clone2DArray(layering));
    // Perform the barycenter method going up and down the layers.
    var sweepCounter = 1;
    while (true) {
        layering = singleUpDownSweep(ocpn, layering, testConfig); // Phase 1
        layering = adjustEqualBarycenters(ocpn, layering) // Phase 2
        var currentScore = computeLayeringScore(ocpn, layering, testConfig);
        console.log(`Sweep ${sweepCounter} score: ${currentScore}\nLayering:`);
        console.log(layering);
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
            console.log(`Terminating barycenter sweep due to reocurring layering! (Iteration: ${sweepCounter})`);
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
            // Adjusts only the layering[layer] while keeping the other layers fixed.
            layering = modifiedBarycenterOrder(ocpn, layering, layer, dir == 0, config);
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
function modifiedBarycenterOrder(ocpn, layering, layer, down, config) {
    // Compute the barycenter values for the current layer.
    var barycenters = computeModifiedBarycenters(ocpn, layering, layer, down, config);
    // Sort the vertices in the layer according to the barycenter values.
    // The greater the barycenter value the more to the right the vertex is placed.
    // Equal barycenter values are sorted by the original order.
    layering[layer].sort((a, b) => barycenters[a] - barycenters[b]);
    return layering;
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} layering 
 * @param {*} layer 
 * @param {*} down 
 */
function computeModifiedBarycenters(ocpn, layering, layer, down, config) {
    var barycenters = {};
    var vertices = layering[layer];
    for (let i = 0; i < vertices.length; i++) {
        var vName = vertices[i];
        var v = ocpn.findElementByName(vName);
        if (v instanceof ObjectCentricPetriNet.Place) {
            barycenters[vName] = placeBarycenter(ocpn, v, layering, layer, down, config);
        } else if (v instanceof ObjectCentricPetriNet.Transition) {
            barycenters[vName] = transitionBarycenter(ocpn, v, layering, layer, down, config);
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
function placeBarycenter(ocpn, place, layering, layer, down, config) {
    var fixedLayer = down ? layer - 1 : layer + 1;
    // Only consider vertices (transitions or dummies) in the next fixed layer.
    var neighbors = place.inArcs.map(arc => arc.source)
        .concat(place.outArcs.map(arc => arc.target))
        .filter(v => v.layer == fixedLayer);

    // If there are no neighbors in the fixed layer, return the current index + 1.
    if (neighbors.length == 0) {
        return layering[layer].indexOf(place.name) + 1; // TODO: add (1- oa) ... + oa * ...
    }

    // Compute the barycenter value.
    var barycenter = 0;
    var objectBarycenter = 0;
    for (let i = 0; i < neighbors.length; i++) {
        barycenter += layering[fixedLayer].indexOf(neighbors[i].name) + 1;
    }

    // Get the average index of all places of the same object type in the layers above (down) or below (up).
    var objectNeighbors = [];
    for (let i = config.objectAttractionRangeMin; i <= config.objectAttractionRangeMax; i++) {
        let layerIndex = down ? layer - 2 * i : layer + 2 * i;
        if (layerIndex < 0 || layerIndex >= layering.length) {
            break;
        } else {
            let ons = layering[layerIndex].filter(v => ocpn.findElementByName(v).objectType == place.objectType)
            objectNeighbors = objectNeighbors.concat(ons.map(on => layering[layerIndex].indexOf(on) + 1));
        }
    }
    objectBarycenter = objectNeighbors.length > 0 ? objectNeighbors.reduce((a, b) => a + b) / objectNeighbors.length : 0;
    barycenter = barycenter / neighbors.length;

    // If there are no places of the same object type in the layers above or below, return the computed barycenter.
    if (objectBarycenter == 0) {
        return barycenter;
    }
    // Return the weighted average of the barycenter and the object barycenter.
    return (1 - config.objectAttraction) * barycenter + config.objectAttraction * objectBarycenter;
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
function transitionBarycenter(ocpn, transition, layering, layer, down, config) {
    // For transitions we only need to regard adjacent vertices (places or dummies) in the fixed layer.
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
    var neighbor = down ? (dummy.arcReversed ? dummy.to : dummy.from) : (dummy.arcReversed ? dummy.from : dummy.to);
    var index = layering[fixedLayer].indexOf(neighbor.name) + 1;
    return index;
}

/**
 * For now just computes the crossing count.
 * TODO: implement a combination of the crossing count, the object attraction, and additional constraints. 
 * @param {*} ocpn The object centric petri net.
 * @param {*} layering The current layering of the OCPN.
 * @param  
 */
function computeLayeringScore(ocpn, layering, config) {
    // Compute the crossing count.
    var crossingCount = countCrossings(ocpn, layering);
    // Compute value that measures the quality of object attraction in the current layering.
    var objectAttractionCount = measureObjectAttractionCount(ocpn, layering, config);
    // Return combined score.  oa is always 0 currently -> only the crossing count is considered.
    return (1 - config.objectAttraction) * crossingCount + config.objectAttraction * objectAttractionCount; // TODO: check if this is the correct formula.
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
    for (let l = 0; l < layering.length - 1; l++) {
        // Get all arcs between the current and the next layer.
        var arcs = ocpn.arcs.filter(arc =>
            arc.reversed ? arc.target.layer == l && arc.source.layer == l + 1 :
                arc.source.layer == l && arc.target.layer == l + 1);

        var currLayer = layering[l];
        var nextLayer = layering[l + 1];
        // Compute the crossings between the current and the next layer.
        for (let i = 0; i < arcs.length - 1; i++) {
            for (let j = i + 1; j < arcs.length; j++) {
                // Check for each pair of arcs between the current and next layer if they cross.
                let arc1 = arcs[i];
                let arc2 = arcs[j];
                // Get the indices of the adjacent vertices in the current and next layer.
                let upper1Index = arc1.reversed ? currLayer.indexOf(arc1.target.name) : currLayer.indexOf(arc1.source.name);
                let lower1Index = arc1.reversed ? nextLayer.indexOf(arc1.source.name) : nextLayer.indexOf(arc1.target.name);
                let upper2Index = arc2.reversed ? currLayer.indexOf(arc2.target.name) : currLayer.indexOf(arc2.source.name);
                let lower2Index = arc2.reversed ? nextLayer.indexOf(arc2.source.name) : nextLayer.indexOf(arc2.target.name);

                // Check if the arcs cross.
                if (upper1Index > upper2Index && lower1Index < lower2Index ||
                    upper1Index < upper2Index && lower1Index > lower2Index) {
                    // console.log(`Crossing arcs (${arc1.source.name}, ${arc1.target.name}) and (${arc2.source.name}, ${arc2.target.name})...`);
                    crossings++;
                }
            }
        }
    }
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
 * @param {*} config
 */
function measureObjectAttractionCount(ocpn, layering, config) {
    // For each object type compute the average deviation from the average index.
    var objectDeviation = 0;
    ocpn.objectTypes.forEach(objectType => {
        var objectPlaces = [];
        // Get the indices of the places of the current object type in each layer.
        for (let l = 0; l < layering.length; l++) {
            let places = layering[l].filter(v => ocpn.findElementByName(v).objectType == objectType);
            objectPlaces = objectPlaces.concat(places.map(place => ({name: place, index: layering[l].indexOf(place) + 1})));
        }
        // Compute the average index of the places of the current object type.
        var avgIndex = objectPlaces.reduce((a, b) => a + b.index, 0) / objectPlaces.length;
        for (let i = 0; i < objectPlaces.length; i++) {
            objectDeviation += Math.abs(objectPlaces[i].index - avgIndex);
        }
    });
    return objectDeviation * (config.objectAttraction * 10); // TODO: either introduce a new config parameter or rework the * 10.
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
