import ObjectCentricPetriNet from "./ObjectCentricPetriNet";

class OCPNGraph {
    nodes: string[];
    arcs: { source: string, target: string, reversed: boolean }[];

    constructor(ocpn: ObjectCentricPetriNet) {
        this.nodes = ocpn.getNodeIds();
        this.arcs = ocpn.getArcs();
    }

    getSink() {
        return this.nodes.find(node => this.getOutDegree(node) === 0) || null;
    }

    getSource() {
        return this.nodes.find(node => this.getInDegree(node) === 0) || null;
    }

    removeNode(node: string) {
        this.nodes = this.nodes.filter(n => n !== node);
        this.arcs = this.arcs.filter(arc => arc.source !== node && arc.target !== node);
    }

    removeNodes(nodes: string[]) {
        this.nodes = this.nodes.filter(n => !nodes.includes(n));
        this.arcs = this.arcs.filter(arc => !nodes.includes(arc.source) && !nodes.includes(arc.target));
    }

    getInDegree(node: string) {
        return this.arcs.filter(arc => arc.target === node).length;
    }

    getOutDegree(node: string) {
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