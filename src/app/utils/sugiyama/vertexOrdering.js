// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');


function orderVertices(ocpn, layering) {
    // Apply the barycenter heuristic to order the vertices in each layer.
    // TODO: add ocpn characteristics from bachelor-thesis in the algorithm.
    //       For now we use the default barycenter heuristic.
    return layering;
}

module.exports = orderVertices;