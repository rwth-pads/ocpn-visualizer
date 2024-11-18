// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

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

    for (const verticalDir in ['down', 'up']) {
        for (const horizontalDir in ['left', 'right']) {
            verticalAlignment(ocpn, layering, verticalDir, horizontalDir);
            horizontalCompaction(ocpn, layering, verticalDir, horizontalDir);
        }
    }
    // Align to assignment of smallest width (height).
    alignAssignments(ocpn, layering);
    // Set the actual coordinates to average median of aligned candidates.
    setCoordinates(ocpn, layering);
}

/**
 * Marks the type 1 conflicts in the OCPN given the layering.
 * A type 1 conflict occurs when a non-inner segment crosses an inner segment.
 *
 * @param {*} ocpn 
 * @param {*} layering
 * for i ← 2,...,h − 2 do
 *      k0 ← 0; l ← 1;
 *      for l1 ← 1,..., |Li+1| do
 *          if l1 = |Li+1| or v(i+1)_l1 incident to inner segment between Li+1 and Li
 *          then
 *              k1 ← |Li|;
 *              if v(i+1)_l1 incident to inner segment between Li+1 and Li then
 *                  k1 ← pos[upper neighbor of v(i+1)_l1 ];
 *              while l ≤ l1 do
 *                  foreach upper neighbor v(i)_k of v(i+1)_l do
 *                      if k<k0 or k>k1 then mark segment (v(i)_k , v(i+1)_l );
 *                  l ← l + 1;
 *              k0 ← k1;
 * 
 *  h = layeringHeight
 *  
 */
function markType1Conflicts(ocpn, layering) {
    console.log("Marking type 1 conflicts...");
    var conflictCount = 0;
    // Between layer first and second (last - 1 and last) there cannot be any type 1 conflicts.
    for (let i = 1; i < layering.length - 2; i++) {
        const layer = layering[i];
        const nextLayer = layering[i + 1];
        let k0 = 0;
        let l = 1;

        for (let l1 = 1; l1 < nextLayer.length; l1++) {
            if (l1 == nextLayer.length - 1 || isIncidentToInnerSegment(ocpn, nextLayer[l1])) {
                let k1 = layer.length - 1;
                if (isIncidentToInnerSegment(ocpn, nextLayer[l1])) {
                    k1 = layer.indexOf(ocpn, getUpperNeighbors(ocpn, nextLayer[l1])[0]);
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
                            console.log(`Marking arc (${upperNeighbor}, ${nextLayer[l]}) as type 1...`);
                            arc.forEach(a => {
                                a.type1 = true;
                                conflictCount++;
                            });
                        }
                    });
                    l++;
                }
                k0 = k1;
            }
        }
    }
    return conflictCount;
}

/**
 * Checks whether the vertex is incident to an inner segment.
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

function verticalAlignment(ocpn, layering, verticalDir, horizontalDir) {
    console.log(`Vertical alignment ${verticalDir == 0 ? 'down' : 'up'} in ${horizontalDir == 0 ? 'left' : 'right'}mostfashion...`);
}

function horizontalCompaction(ocpn, layering, verticalDir, horizontalDir) {
    console.log(`Horizontal compaction ${verticalDir == 0 ? 'down' : 'up'} in ${horizontalDir == 0 ? 'left' : 'right'}mostfashion...`);
}

function alignAssignments(ocpn, layering) {
    console.log("Aligning assignments...");
}

function setCoordinates(ocpn, layering) {
    console.log("Setting coordinates...");
}

module.exports = { positionVertices, markType1Conflicts, getUpperNeighbors, isIncidentToInnerSegment};

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