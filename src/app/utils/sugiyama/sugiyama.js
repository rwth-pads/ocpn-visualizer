import reverseCycles from './cycleBreaking';
import assignLayers from './layerAssignment';
import insertDummyVertices from './dummyVertexInsertion';
import orderVertices from './vertexOrdering';
import positionVertices from './vertexPositioning';
import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';


/**
 * 
 * @param {ObjectCentricPetriNet} ocpn 
 * @returns 
 */
async function sugiyama(ocpn) {
    console.log("Sugiyama input: ", ocpn);
    // Cycle Breaking.
    var reversedArcsCount = reverseCycles(ocpn, [], []);
    // Layer Assignment.
    var layering = await assignLayers(ocpn);
    // Dummy Vertex Insertion.
    var [dummyCount, layeringArray] = insertDummyVertices(ocpn, layering);
    console.log("Dummies ", layeringArray);
    // Vertex Ordering.
    var [layeringScore, layeringArray] = orderVertices(ocpn, layeringArray, { oa: 0 });
    console.log("Order ", layeringArray);
    // Vertex Positioning.
    positionVertices(ocpn, layeringArray, { ranksep: 1 });
    // TODO: transform dummy vertices to edge points and reverse reversed arcs back to normal direction.
    return ocpn;
}

export default sugiyama;