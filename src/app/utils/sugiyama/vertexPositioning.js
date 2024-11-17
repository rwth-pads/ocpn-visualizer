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
    markType1Conflicts(ocpn, layering);

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
 */
function markType1Conflicts(ocpn, layering) {
    console.log("Marking type 1 conflicts...");
}

function verticalAlignment(ocpn, layering, verticalDir, horizontalDir) {
    console.log(`Vertical alignment ${verticalDir ? 'down' : 'up'} in ${horizontalDir ? 'left' : 'right'}mostfashion...`);
}

function horizontalCompaction(ocpn, layering, verticalDir, horizontalDir) {
    console.log(`Horizontal compaction ${verticalDir ? 'down' : 'up'} in ${horizontalDir ? 'left' : 'right'}mostfashion...`);
}

function alignAssignments(ocpn, layering) {
    console.log("Aligning assignments...");
}

function setCoordinates(ocpn, layering) {
    console.log("Setting coordinates...");
}

module.exports = positionVertices;

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