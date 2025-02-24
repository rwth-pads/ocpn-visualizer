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
    // console.time("Sugiyama");

    if (!(ocpn instanceof ObjectCentricPetriNet)) {
        console.log("The input is not an Object Centric Petri Net.");
        return undefined;
    }

    if (!(config instanceof OCPNConfig)) {
        console.log("The input is not an OCPNConfig.");
        return undefined;
    }

    // Generate the initial layout.
    ocpn.layout = new OCPNLayout(ocpn, config);

    // Cycle Breaking.
    reverseCycles(ocpn, config);

    // Layer Assignment.
    await assignLayers(ocpn);

    // Dummy Vertex Insertion.
    insertDummyVertices(ocpn);

    // Vertex Ordering.
    orderVertices(ocpn, config);

    // Vertex Positioning.
    if (config.seeAlignmentType) {
        // Only for debugging purposes.
        positioning.positionVerticesToAlignmentType(ocpn, config);
    } else {
        positioning.positionVertices(ocpn, config);
    }

    // Route edges.
    routeArcs(ocpn);

    // console.timeEnd("Sugiyama");
    // Return the OCPN Layout.
    return ocpn.layout;
}

export default sugiyama;