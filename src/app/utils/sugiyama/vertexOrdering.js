import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';
import { clone2DArray, arraysEqual } from '../lib/arrays';

/**
 * Orders the vertices within the layers of the OCPN according to the barycenter method.
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} layering 
 * @param {*} config 
 * @returns 
 */
function orderVertices(ocpn, config) {
    // Adjust the initial order within the layering according to the users object centrality.
    if (config.objectCentrality !== undefined) {
        console.log("Adjusting Initial Relative Order of Vertices...", config.objectCentrality);
        adjustLayeringOrderByObjectCentrality(ocpn, config);
    }
    // Implementation of the barycenter method for vertex ordering.
    upDownBarycenterBilayerSweep(ocpn, config);
    // console.log("Best Layering: ", ocpn.layout.layering);
    // Set the positions of the vertices in the layering according to the computed order.
    for (let i = 0; i < ocpn.layout.layering.length; i++) {
        for (let j = 0; j < ocpn.layout.layering[i].length; j++) {
            let v = ocpn.layout.layering[i][j];
            ocpn.layout.vertices[v].pos = j;
            // console.log(`${v} at pos ${ocpn.layout.vertices[v].pos}`);
        }
    }
}

/**
 * Adjusts the initial order of the vertices within the layering according to the user defined object centrality. 
 */
function adjustLayeringOrderByObjectCentrality(ocpn, config) {
    // console.log("Adjusting layering order by object centrality...");
    const objectCentrality = config.objectCentrality;
    // Iterate over the layers of the OCPN.
    for (let i = 0; i < ocpn.layout.layering.length; i++) {
        let j = 0;
        let layerType = OCPNLayout.DUMMY_TYPE;
        while (j < ocpn.layout.layering[i].length) {
            // Check whether the current layer is a 'place' or 'transition' layer.
            let type = ocpn.layout.vertices[ocpn.layout.layering[i][j]].type;
            console.log(`\tLayer ${i} Type: ${type}`);
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
            let l = ocpn.layout.layering[i].sort((a, b) =>
                (objectCentrality[ocpn.layout.vertices[a].objectType] ?? 0)
                - (objectCentrality[ocpn.layout.vertices[b].objectType] ?? 0));
        }
    }
}

/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @param {*} config 
 * @returns 
 */
function upDownBarycenterBilayerSweep(ocpn, config) {
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
        layering = singleUpDownSweep(ocpn, layering, config); // Phase 1
        // console.log("UpDown ", layering);
        layering = adjustEqualBarycenters(ocpn, layering) // Phase 2
        var currentScore = computeLayeringScore(ocpn, layering, config);
        // console.log(`Sweep ${sweepCounter} score: ${currentScore}\nLayering:`);
        // console.log(layering);
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
        var v = vertices[i];
        if (ocpn.layout.vertices[v].type === OCPNLayout.PLACE_TYPE) {
            barycenters[v] = placeBarycenter(ocpn, v, layering, layer, down, config);
        } else if (ocpn.layout.vertices[v].type === OCPNLayout.TRANSITION_TYPE) {
            barycenters[v] = transitionBarycenter(ocpn, v, layering, layer, down);
        } else if (ocpn.layout.vertices[v].type === OCPNLayout.DUMMY_TYPE) {
            barycenters[v] = dummyBarycenter(ocpn, v, layering, layer, down);
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
    var barycenter = 0;
    var objectBarycenter = 0;
    // Get the neighbors of the place in the upper (dir = down) or lower (dir = up) layer.
    var neighbors = ocpn.layout.getAllArcsBetweenRanks(down ? layer - 1 : layer)
        .filter(arc => down ? arc.target === place : arc.source === place)
        .map(arc => down ? arc.source : arc.target);

    // Compute the barycenter value.
    for (let i = 0; i < neighbors.length; i++) {
        barycenter += layering[down ? layer - 1 : layer + 1].indexOf(neighbors[i]) + 1;
    }
    // Get the average index of all places of the same object type in the layers above (down) or below (up).
    var objectNeighbors = [];
    for (let i = config.objectAttractionRangeMin; i <= config.objectAttractionRangeMax; i++) {
        let layerIndex = down ? layer - 2 * i : layer + 2 * i;
        if (layerIndex < 0 || layerIndex >= layering.length) {
            break;
        } else {
            let ons = layering[layerIndex].filter(v => ocpn.layout.vertices[v].objectType == ocpn.layout.vertices[place].objectType);
            objectNeighbors = objectNeighbors.concat(ons.map(on => layering[layerIndex].indexOf(on) + 1));
        }
    }
    objectBarycenter = objectNeighbors.length > 0 ? objectNeighbors.reduce((a, b) => a + b) / objectNeighbors.length : 0;

    // If there are no neighbors in the fixed layer, return the current object barycenter.
    if (neighbors.length == 0) {
        objectBarycenter = objectBarycenter == 0 ? layering[layer].indexOf(place) + 1 : objectBarycenter;
        return objectBarycenter;
    }
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
function transitionBarycenter(ocpn, transition, layering, layer, down) {
    // For transitions we only need to regard adjacent vertices (places or dummies) in the fixed layer.
    var fixedLayer = down ? layer - 1 : layer + 1;
    // Only consider the neighbors that are in the fixed layer.
    var neighbors = ocpn.layout.getAllArcsBetweenRanks(down ? layer - 1 : layer)
        .filter(arc => down ? arc.target === transition : arc.source === transition)
        .map(arc => down ? arc.source : arc.target);

    // console.log(`Transition ${transition} neighbors: `, neighbors);
    // If there are no neighbors in the fixed layer, return the current index + 1.
    if (neighbors.length == 0) {
        return layering[layer].indexOf(transition) + 1;
    }

    // Compute the barycenter value.
    var barycenter = 0;
    for (let i = 0; i < neighbors.length; i++) {
        // TODO: object weight -> different weights for different object types.
        barycenter += layering[fixedLayer].indexOf(neighbors[i]) + 1;
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
function dummyBarycenter(ocpn, dummy, layering, layer, down) {
    // For dummies we return the same value as the source or target's index.
    var d = ocpn.layout.vertices[dummy];
    var neighbor = down ? d.upper : d.lower;
    var index = layering[down ? layer - 1 : layer + 1].indexOf(neighbor) + 1;
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
    return (1 - config.objectAttraction) * crossingCount + config.objectAttraction * objectAttractionCount;
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
        // TODO: next step here.
        var arcs = ocpn.layout.getAllArcsBetweenRanks(l);

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
    ocpn.layout.objectTypes.forEach(objectType => {
        var objectPlaces = [];
        // Get the indices of the places of the current object type in each layer.
        for (let l = 0; l < layering.length; l++) {
            let places = layering[l].filter(v => ocpn.layout.vertices[v].objectType == objectType);
            objectPlaces = objectPlaces.concat(places.map(place => ({ name: place, index: layering[l].indexOf(place) + 1 })));
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

export default orderVertices;