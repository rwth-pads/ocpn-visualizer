// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');
// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';

/**
 * For every arc that spans more than one layer, insert dummy vertices on
 * the intermediate layers.
 *
 * @param {ObjectCentricPetriNet} ocpn - The Object-Centric Petri Net.
 * @param {*} layering Layering of the OCPN.
 * @returns The number of inserted dummy vertices.
 */
function insertDummyVertices(ocpn, layering) {
    var dummyCount = 0;
    for (const arc of ocpn.arcs) {
        let sourceLayer = arc.source.layer; // The layer of the source node.
        let targetLayer = arc.target.layer; // The layer of the target node.
        let dir = arc.reversed ? -1 : 1; // If the arc is reversed, the direction is negative.
        const slack = (targetLayer - sourceLayer) * dir;
        if (slack > 1) {
            // Insert dummy vertices on the intermediate layers.
            for (let i = 1; i < slack; i++) {
                let curLayer = sourceLayer + (i * dir);
                // Create a dummy node.
                var dummy = new ObjectCentricPetriNet.Dummy(
                    `dummy_${arc.source.name}_${arc.target.name}_${curLayer}`,
                    arc.source,
                    arc.target,
                    curLayer
                );
                // Add the dummy node to the OCPN.
                ocpn.dummyNodes.push(dummy);
                // Add the dummy to the layering.
                layering[dummy.layer].push(dummy.name);
                dummyCount++;
            }
        }
        // console.log(`${arc.source.name} (${arc.source.layer}) -> ${arc.target.name} (${arc.target.layer})`);
    }
    return dummyCount;
}

module.exports = insertDummyVertices;