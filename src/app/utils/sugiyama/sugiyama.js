import reverseCycles from './cycleBreaking';
import assignLayers from './layerAssignment';
import insertDummyVertices from './dummyVertexInsertion';
import orderVertices from './vertexOrdering';
import positionVertices from './vertexPositioning';
import routeArcs from './arcRouting';
import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';

/**
 * 
 * @param {*} ocpn 
 * @param {*} config 
 * @returns OCPNLayout The layout of the Object Centric Petri Net.
 */
async function sugiyama(ocpn, config) {
    if (!(ocpn instanceof ObjectCentricPetriNet)) {
        return undefined;
    }
    ocpn.layout = new OCPNLayout(ocpn, config);
    console.log("Sugiyama input: ", ocpn);
    // Cycle Breaking.
    console.log("Reversing cycles...");
    reverseCycles(ocpn, config);
    // Layer Assignment.
    console.log("Assigning layers...");
    await assignLayers(ocpn);
    // Dummy Vertex Insertion.
    console.log("Inserting dummy vertices...");
    insertDummyVertices(ocpn);
    // Vertex Ordering.
    console.log("Ordering vertices...");
    orderVertices(ocpn, config);
    // Vertex Positioning.
    console.log("Positioning vertices...");
    positionVertices(ocpn, config);
    // Route edges.
    console.log("Routing arcs...");
    routeArcs(ocpn);
    // Return the OCPN Layout.
    return ocpn.layout;
}

export default sugiyama;