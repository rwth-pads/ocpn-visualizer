import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';


function routeArcs(ocpn: ObjectCentricPetriNet) {
    // Delete the non-original arcs and add the object type to the remaining arcs.
    if (!ocpn.layout) {
        return;
    }
    for (const arcId in ocpn.layout.arcs) {
        if (!ocpn.layout.arcs[arcId].original) {
            delete ocpn.layout.arcs[arcId];
        } else {
            let source = ocpn.layout.vertices[ocpn.layout.arcs[arcId].source];
            let target = ocpn.layout.vertices[ocpn.layout.arcs[arcId].target];
            let ot = source.type === OCPNLayout.PLACE_TYPE ? source.objectType : target.objectType;
            ocpn.layout.arcs[arcId].objectType = ot;
        }
    }
}

export default routeArcs;