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
    // console.log("Dummy Insertion: ", ocpn);
    for (const [arcId, arc] of Object.entries(ocpn.layout.arcs)) {
        let upper = arc.source;
        let lower = arc.target;
        let sourceLayer = ocpn.layout.vertices[upper].layer;
        let targetLayer = ocpn.layout.vertices[lower].layer;
        let sourceLayerIndex = ocpn.layout.layering[sourceLayer].indexOf(upper);
        let targetLayerIndex = ocpn.layout.layering[targetLayer].indexOf(lower);
        let medianIndex = Math.floor((sourceLayerIndex + targetLayerIndex) / 2);
        ocpn.layout.arcs[arcId].minLayer = sourceLayer;
        ocpn.layout.arcs[arcId].maxLayer = targetLayer;
        const slack = targetLayer - sourceLayer;
        if (slack > 1) {
            let dummies = [];
            // Insert dummy vertices on the intermediate layers.
            for (let i = 1; i < slack; i++) {
                let curLayer = sourceLayer + i;
                // Create a dummy node.
                var dummy = {
                    id: ObjectCentricPetriNet.generateDummyId(),
                    belongsTo: arcId, // The id of the arc the dummy belongs to.
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
                // Insert the dummy into the layering, based on the position of the upper and lower vertices.
                let layer = ocpn.layout.layering[curLayer];
                let insertIndex = Math.min(medianIndex, layer.length);
                layer.splice(insertIndex, 0, dummy.id);
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
                arc.path.push(curDummy); // Add the dummy to the path of the arc.
            }
            // Create two new arcs for markingType1 conflicts in the vertexPositioning step.
            let arc1Id = ObjectCentricPetriNet.generateArcId();
            let arc2Id = ObjectCentricPetriNet.generateArcId();
            // Arc 1: upper -> dummies[0]
            ocpn.layout.arcs[arc1Id] = {
                source: upper,
                target: dummies[0],
                reversed: arc.reversed,
                path: [],
                minLayer: sourceLayer,
                maxLayer: sourceLayer + 1,
                type1: false,
                original: false,
            };
            // Arc 2: dummies[dummies.length - 1] -> lower
            ocpn.layout.arcs[arc2Id] = {
                source: dummies[dummies.length - 1],
                target: lower,
                reversed: arc.reversed,
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