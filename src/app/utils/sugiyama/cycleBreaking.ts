import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNConfig from '../classes/OCPNConfig';
import OCPNGraph from '../classes/OCPNGraph';

/**
 * Function that reverses cycles in the graph represented by the Object Centric Petri Net.
 * 
 * @param {ObjectCentricPetriNet} ocpn The Object Centric Petri Net to reverse cycles in.
 * @param {*} config The configuration object.
 * @returns 
 */
function reverseCycles(ocpn: ObjectCentricPetriNet, config: OCPNConfig) {
    if (!ocpn.layout) {
        return;
    }
    let reversedArcs = 0;
    // Construct the graph from the OCPN.
    var net = new OCPNGraph(ocpn);
    // Compute solution to the modified FAS problem.
    var fas = modifiedGreedyFAS(net, config.sources, config.sinks);

    Object.entries(ocpn.layout.arcs).forEach(([arcId, arc]) => {
        let sourceIndex = fas.indexOf(arc.source);
        let targetIndex = fas.indexOf(arc.target);
        // Reverse the arc if the source's index is greater than the target's index.
        if (ocpn.layout) {
            ocpn.layout.setArcDirection(arcId, sourceIndex > targetIndex);
        }
        reversedArcs += sourceIndex > targetIndex ? 1 : 0;
    });
    return reversedArcs;
}

/**
 * Computes a solution to the Feedback Arc Set problem using a modified greedy algorithm
 * that takes user defined sources and sinks into account. 
 *
 * @param {OCPNGraph} net The graph constructed from an OCPN. 
 * @param {String[]} sources The ids of user selected sources.
 * @param {String[]} sinks The ids of user selected sinks.
 * @returns The solution to the FAS problem.
 */
function modifiedGreedyFAS(net: OCPNGraph, sources: string[], sinks: string[]): string[] {
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

export default reverseCycles;