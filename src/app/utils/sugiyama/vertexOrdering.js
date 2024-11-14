// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');


function orderVertices(ocpn, layering, config) {
    // TODO: Adjust the initial order within the layering according to the users object centrality.
    // adjustLayeringOrderByObjectCentrality(ocpn, layering, config);
    // Implementation of the barycenter method for vertex ordering.
    var baryOrder = upDownBarycenterBilayerSweep(ocpn, layering, config);
    return baryOrder;
}

/**
 * 
 * @param {*} ocpn 
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
    var best = layering;
    // 
    var computedLayerings = [];
    computedLayerings.push(layering);
    // Perform the barycenter method going up and down the layers.
    for (let i = 0; ; i++) {
        layering = singleUpDownSweep(ocpn, layering, i % 2 == 0, config);
        var currentScore = computeLayeringScore(ocpn, layering, OBJECT_ATTRACTION);
        // Check if the vertex order has improved.
        if (currentScore < bestScore) {
            bestScore = currentScore;
            best = layering;
            noImprovementCounter = 0;
        } else {
            // Increment the counter if no improvement was made.
            noImprovementCounter++;
        }
        // Check the termination conditions.
        if (noImprovementCounter >= MAXITERATIONS || reocurringLayering(i, layering, computedLayerings)) {
            break;
        } else {
            computedLayerings.push(layering);
        }
    }
    return [bestScore, best];
}

function reocurringLayering(sweepIteration, currentLayering, computedLayerings) {
    // The sweep has to be performed at least once up and down.
    if (sweepIteration / 2 < 1) {
        return false;
    }
    // Check if the current layering has already been computed.
    for (let i = 0; i < computedLayerings.length; i++) {
        if (currentLayering == computedLayerings[i]) {
            return true;
        }
    }
    return false;
}

function singleUpDownSweep(ocpn, layering, down, config) {
    // TODO
    return layering;
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
 * The crossing count is a value that measures the number of crossings in the layering.
 * 
 * The lower the value the "better" the layering.
 * @param {*} ocpn 
 * @param {*} layering 
 */
function countCrossings(ocpn, layering) {
    // TODO
    return 0;
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
