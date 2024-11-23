import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';

/**
 * For every arc that spans more than one layer, insert dummy vertices on
 * the intermediate layers.
 *
 * @param {ObjectCentricPetriNet} ocpn - The Object-Centric Petri Net.
 * @param {*} layering Layering of the OCPN.
 * @returns The number of inserted dummy vertices and the layering as array of arrays.
 */
function insertDummyVertices(ocpn) {
    var dummyCount = 0;
    console.log("Dummy Insertion: ", ocpn);
    for (const arc of ocpn.arcs) {
        let upper = ocpn.layout.arcs[arc.id].source;
        let lower = ocpn.layout.arcs[arc.id].target;
        let sourceLayer = ocpn.layout.vertices[upper].layer;
        let targetLayer = ocpn.layout.vertices[lower].layer;
        ocpn.layout.arcs[arc.id].minLayer = sourceLayer,
        ocpn.layout.arcs[arc.id].maxLayer = targetLayer;
        const slack = targetLayer - sourceLayer;
        if (slack > 1) {
            let dummies = [];
            // Insert dummy vertices on the intermediate layers.
            for (let i = 1; i < slack; i++) {
                let curLayer = sourceLayer + i;
                // Create a dummy node.
                var dummy = {
                    id : ObjectCentricPetriNet.generateDummyId(),
                    belongsTo: arc.id, // The id of the arc the dummy belongs to.
                    type: OCPNLayout.DUMMY_TYPE,
                    x: undefined,
                    y: undefined,
                    layer: curLayer,
                    pos: -1,
                    upper: undefined, // The id of the vertex above the dummy.
                    lower: undefined, // The id of the vertex below the dummy.
                };
                dummies.push(dummy.id);
                // Add the dummy to the layout.
                ocpn.layout.vertices[dummy.id] = dummy;
                ocpn.layout.layering[curLayer].push(dummy.id);
                // Add the dummy to the layering.
                dummyCount++;
            }
            // Sort dummies by ascending layer.
            dummies.sort((a, b) => ocpn.layout.vertices[a].layer - ocpn.layout.vertices[b].layer);
            // Set the upper and lower vertex of the dummies.
            for (let i = 0; i < dummies.length; i++) {
                let curDummy = dummies[i];
                ocpn.layout.vertices[curDummy].upper = i === 0 ? upper : dummies[i - 1];
                ocpn.layout.vertices[curDummy].lower = i === dummies.length - 1 ? lower : dummies[i + 1];
                ocpn.layout.arcs[arc.id].path.push(curDummy); // Add the dummy to the path of the arc.
            }
            // Create two new arcs for markingType1 conflicts in the vertexPositioning step.
            let arc1Id = ObjectCentricPetriNet.generateArcId();
            let arc2Id = ObjectCentricPetriNet.generateArcId();
            ocpn.layout.arcs[arc1Id] = {
                source: upper,
                target: dummies[0],
                reversed: ocpn.layout.arcs[arc.id].reversed,
                path: [],
                minLayer: sourceLayer,
                maxLayer: sourceLayer + 1,
                type1: false,
                original: false,
            };
            ocpn.layout.arcs[arc2Id] = {
                source: dummies[dummies.length - 1],
                target: lower,
                reversed: ocpn.layout.arcs[arc.id].reversed,
                path: [],
                minLayer: targetLayer - 1,
                maxLayer: targetLayer,
                type1: false,
                original: false,
            };
        }
    }
}

export default insertDummyVertices;