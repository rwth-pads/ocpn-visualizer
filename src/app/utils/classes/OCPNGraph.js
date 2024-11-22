import ObjectCentricPetriNet from "./ObjectCentricPetriNet";
// const ObjectCentricPetriNet = require('./ObjectCentricPetriNet');

class OCPNGraph {
    /**
     * Class that represents the graph of an Object Centric Petri Net.
     * 
     * @param {ObjectCentricPetriNet} ocpn 
     */
    constructor(ocpn) {
        this.nodes = ocpn.getNodeIds();
        this.arcs = ocpn.getArcs();
    }

    /**
     * Gets the sink of a graph, if it exists.
     * 
     * @returns A sink of the graph.
     */
    getSink() {
        return this.nodes.find(node => this.getOutDegree(node) === 0) || null;
    }

    /**
     * Gets the source of a graph, if it exists.
     * 
     * @returns A source of the graph.
     */
    getSource() {
        return this.nodes.find(node => this.getInDegree(node) === 0) || null;
    }

    /**
     * Removes a node and its corresponding arcs from the graph.
     * 
     * @param {String} node The node to remove.
     */
    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
        this.arcs = this.arcs.filter(arc => arc.source !== node && arc.target !== node);
    }

    /**
     * Removes an array of nodes and their corresponding arcs from the graph.
     * 
     * @param {String[]} nodes 
     */
    removeNodes(nodes) {
        this.nodes = this.nodes.filter(n => !nodes.includes(n));
        this.arcs = this.arcs.filter(arc => !nodes.includes(arc.source) && !nodes.includes(arc.target));
    }

    /**
     * Gets the in degree of a node.
     * 
     * @param {String} node The id of the node.
     * @returns The in degree of the node.
     */
    getInDegree(node) {
        return this.arcs.filter(arc => arc.target === node).length;
    }

    /**
     * Gets the out degree of a node.
     * 
     * @param {String} node The id of the node.
     * @returns The out degree of the node.
     */
    getOutDegree(node) {
        return this.arcs.filter(arc => arc.source === node).length;
    }

    /**
     * Gets the node with the highest outDegree - inDegree in the graph.
     * 
     * @returns The node with the highest out degree.
     */
    getMaxOutDegreeNode() {
        let max = Number.MIN_SAFE_INTEGER;
        var maxNode = this.nodes[0];
        this.nodes.forEach(n => {
            let deg = this.getOutDegree(n) - this.getInDegree(n);
            if (deg > max) {
                maxNode = n;
                max = deg;
            }
        });
        return maxNode;
    }
}


export default OCPNGraph;
// module.exports = OCPNGraph;