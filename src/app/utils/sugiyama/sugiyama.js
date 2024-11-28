import reverseCycles from './cycleBreaking';
import assignLayers from './layerAssignment';
import insertDummyVertices from './dummyVertexInsertion';
import orderVertices from './vertexOrdering';
import positionVertices from './vertexPositioning';
import routeArcs from './arcRouting';
import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';
import OCPNConfig from '../classes/OCPNConfig';

/**
 * 
 * @param {*} ocpn 
 * @param {*} config 
 * @returns OCPNLayout The layout of the Object Centric Petri Net.
 */
async function sugiyama(ocpn, config) {
    console.log("Sugiyama layouting...");
    if (!(ocpn instanceof ObjectCentricPetriNet)) {
        return undefined;
    }
    if (!(config instanceof OCPNConfig)) {
        return undefined;
    }
    console.log("Check included object types: ", config.includedObjectTypes);
    ocpn.layout = new OCPNLayout(ocpn);
    // console.log("Sugiyama input: ", ocpn);
    // Cycle Breaking.
    // console.log("\tReversing cycles...");
    reverseCycles(ocpn, config);
    // Layer Assignment.
    // console.log("\tAssigning layers...");
    await assignLayers(ocpn);
    // Dummy Vertex Insertion.
    // console.log("\tInserting dummy vertices...");
    insertDummyVertices(ocpn);
    // Vertex Ordering.
    // console.log("\tOrdering vertices...");
    orderVertices(ocpn, config);
    // Vertex Positioning.
    // console.log("\tPositioning vertices...");
    positionVertices(ocpn, config);
    // Route edges.
    // console.log("\tRouting arcs...");
    routeArcs(ocpn);
    // Return the OCPN Layout.
    return ocpn.layout;
}

export default sugiyama;