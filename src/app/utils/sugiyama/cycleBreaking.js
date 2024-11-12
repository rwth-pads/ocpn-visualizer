// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
// import OCPNGraph from '../classes/OCPNGraph';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');
const OCPNGraph = require('../classes/OCPNGraph');

/**
 * Function that reverses cycles in the graph represented by the Object Centric Petri Net.
 * 
 * @param {ObjectCentricPetriNet} ocpn The Object Centric Petri Net to reverse cycles in.
 * @param {String[]} sources The ids of the places that are marked as sources.
 * @param {String[]} sinks The ids of the places that are marked as sinks.
 * @returns {ObjectCentricPetriNet} Acyclic OCPN with reversed edges.
 */
function reverse_cycles(ocpn, sources, sinks) {
    // Construct the graph from the OCPN.
    var net = new OCPNGraph(ocpn);
    // Get the solution to the modified FAS problem.
    var fas = modifiedGreedyFAS(net, sources, sinks);
    console.log("FAS: ", fas);
    ocpn.arcs.forEach(arc => {
        let sourceIndex = fas.indexOf(arc.source.name);
        let targetIndex = fas.indexOf(arc.target.name);
        console.log(`${arc.source.name}(${sourceIndex}) -> ${arc.target.name}(${targetIndex})${sourceIndex > targetIndex ? ' REVERSED' : ''}`);
        // Edges where the target is in front of the source are reversed.
        arc.setReverse(sourceIndex > targetIndex);
    });
}

/**
 * 
 * @param {OCPNGraph} net The graph constructed from an OCPN. 
 * @param {String[]} sources The ids of user selected sources.
 * @param {String[]} sinks The ids of user selected sinks.
 * @returns The solution to the FAS problem.
 */
function modifiedGreedyFAS(net, sources, sinks) {
    var s1 = [...sources]; // The id's of places belonging to s1.
    var s2 = [...sinks]; // The id's of places belonging to s2.

    if (s1.length > 0) {
        // Sort the sources based on highest outDegree - inDegree.
        s1.sort((a, b) => net.getOutDegree(b) - net.getInDegree(b) - net.getOutDegree(a) + net.getInDegree(a));
        net.removeNodes(sources);
    }
    if (s2.length > 0) {
        // Sort the sinks based on highest outDegree - inDegree.
        s2.sort((a, b) => net.getOutDegree(b) - net.getInDegree(b) - net.getOutDegree(a) + net.getInDegree(a));
        net.removeNodes(sinks);
    }
    console.log("s1: ", s1);
    console.log("s2: ", s2);
    // While there are nodes remaining in the graph.
    while (net.nodes.length > 0) {
        // While the net contains sinks, add the sink to the front of s2 and remove it and its edges from the net.
        let sink = null;
        while (sink = net.getSink()) {
            s2.unshift(sink);
            net.removeNode(sink);
        }
        // While the net contains sources, add source to the end of s1 and remove it and all its edges from the net.
        let source = null;
        while (source = net.getSource()) {
            s1.push(source);
            net.removeNode(source);
        }
        // Remove the node with the currently highest outDegree and add it to the end of s1.
        if (net.nodes.length > 0) {
            let node = net.getMaxOutDegreeNode();
            s1.push(node);
            net.removeNode(node);
        }
    }
    // Return s1 ++ s2.
    return s1.concat(s2);
}

// export default reverse_cycles;
module.exports = reverse_cycles;