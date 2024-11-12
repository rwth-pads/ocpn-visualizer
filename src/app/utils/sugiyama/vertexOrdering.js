// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');


function orderVertices(ocpn, layering, config) {
    var crossingCount = 0;
    // Apply the barycenter heuristic to order the vertices in each layer.
    // TODO: add ocpn characteristics from bachelor-thesis in the algorithm.
    //       For now we use the default barycenter heuristic.
    return crossingCount;
}

module.exports = orderVertices;