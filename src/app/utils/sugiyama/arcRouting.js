// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNLayout from '../classes/OCPNLayout';


function routeArcs(ocpn) {
    // Delete the non-original arcs.
    // console.log(Object.keys(ocpn.layout.arcs).length);
    for (const arcId in ocpn.layout.arcs) {
        if (!ocpn.layout.arcs[arcId].original) {
            delete ocpn.layout.arcs[arcId];
        }
    }
    // console.log(Object.keys(ocpn.layout.arcs).length);
    // For every arc, route the path through the dummy vertices.
    for (const arcId in ocpn.layout.arcs) {
        const arc = ocpn.layout.arcs[arcId];
        if (arc.path.length > 0) {
            const start = arc.path[0];
            const end = arc.path[arc.path.length - 1];
            const point1 = {
                x: ocpn.layout.vertices[start].x,
                y: ocpn.layout.vertices[start].y,
            }
            const point2 = {
                x: ocpn.layout.vertices[end].x,
                y: ocpn.layout.vertices[end].y,
            }
            // We assume a straight line between the start and end points.
            arc.path = [point1, point2]; // Replace the dummy vertices with the edge points.
        }
    }
    // Delete the dummy vertices from the layout.
    for (const vertexId in ocpn.layout.vertices) {
        if (ocpn.layout.vertices[vertexId].type === OCPNLayout.DUMMY_TYPE) {
            delete ocpn.layout.vertices[vertexId];
        }
    }
}

export default routeArcs;