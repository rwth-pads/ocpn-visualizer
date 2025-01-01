import reverseCycles from './cycleBreaking';
import assignLayers from './layerAssignment';
import insertDummyVertices from './dummyVertexInsertion';
import orderVertices from './vertexOrdering';
import positioning from './vertexPositioning';
import routeArcs from './arcRouting';
import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';
import OCPNConfig from '../classes/OCPNConfig';

/**
 * 
 * @param {*} ocpn 
 * @param {OCPNConfig} config 
 * @returns OCPNLayout The layout of the Object Centric Petri Net.
 */
async function sugiyama(ocpn: ObjectCentricPetriNet, config: OCPNConfig) {
    console.time("Sugiyama");
    // console.log("sugiyama ocpn: ", ocpn);
    if (!(ocpn instanceof ObjectCentricPetriNet)) {
        console.log("The input is not an Object Centric Petri Net.");
        return undefined;
    }

    if (!(config instanceof OCPNConfig)) {
        console.log("The input is not an OCPNConfig.");
        return undefined;
    }
    // console.log("Check included object types: ", config.includedObjectTypes);
    ocpn.layout = new OCPNLayout(ocpn, config);
    // console.log("Sugiyama input: ", ocpn);
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
    console.log("Initial Layering: ", ocpn.layout.layering);
    orderVertices(ocpn, config);
    // Vertex Positioning.
    console.log("Positioning vertices...");
    if (config.seeAlignmentType) {
        positioning.positionVerticesToAlignmentType(ocpn, config);
    } else {
        positioning.positionVertices(ocpn, config);
    }
    // Route edges.
    console.log("Routing arcs...");
    routeArcs(ocpn);
    // Return the OCPN Layout.
    // console.log("In sugiyama.js", ocpn.layout);
    console.timeEnd("Sugiyama");
    return ocpn.layout;
}

export default sugiyama;