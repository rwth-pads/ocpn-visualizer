import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
// const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

/**
 * For every arc that spans more than one layer, insert dummy vertices on
 * the intermediate layers.
 *
 * @param {ObjectCentricPetriNet} ocpn - The Object-Centric Petri Net.
 * @param {*} layering Layering of the OCPN.
 * @returns The number of inserted dummy vertices and the layering as array of arrays.
 */
function insertDummyVertices(ocpn, layering) {
    var dummyCount = 0;
    console.log("Dummy Insertion: ", ocpn);
    for (const arc of ocpn.arcs) {
        let sourceLayer = arc.source.layer; // The layer of the source node.
        let targetLayer = arc.target.layer; // The layer of the target node.
        let dir = arc.reversed ? -1 : 1; // If the arc is reversed, the direction is negative.
        const slack = (targetLayer - sourceLayer) * dir;
        if (slack > 1) {
            let dummies = [];
            // Insert dummy vertices on the intermediate layers.
            for (let i = 1; i < slack; i++) {
                let curLayer = sourceLayer + (i * dir);
                // Create a dummy node.
                var dummy = new ObjectCentricPetriNet.Dummy(
                    `dummy_${arc.source.name}_${arc.target.name}_${curLayer}`,
                    arc.source,
                    arc.target,
                    curLayer,
                    arc.reversed
                );
                // Add the dummy node to the OCPN.
                ocpn.dummyNodes.push(dummy);
                dummies.push(dummy);
                // Add the dummy to the layering.
                layering[dummy.layer].push(dummy.name);
                dummyCount++;
            }

            // Insert arcs between the dummies and delete the original arc.
            let newArc = new ObjectCentricPetriNet.Arc(arc.source, dummies[0], arc.reversed);
            ocpn.arcs.push(newArc);
            arc.source.outArcs.push(newArc);
            for (let i = 0; i < dummies.length; i++) {
                let curDummy = dummies[i];
                curDummy.from = i == 0 ? arc.source : dummies[i - 1];
                curDummy.to = i == dummies.length - 1 ? arc.target : dummies[i + 1];
                // Create a new arc.
                newArc = new ObjectCentricPetriNet.Arc(curDummy, curDummy.to, arc.reversed);
                ocpn.arcs.push(newArc);
            }
            arc.target.inArcs.push(newArc);
            // Delete the original arc.
            ocpn.deleteArc(arc);
        }
    }
    // Transform the layering object to an array of arrays.
    // Each inner array represents a layer and contains the names of the nodes in that layer.
    var layeringArray = [];
    for (const layer of Object.keys(layering)) {
        layeringArray.push(layering[layer]);
    }
    return [dummyCount, layeringArray];
}

// module.exports = insertDummyVertices;
export default insertDummyVertices;