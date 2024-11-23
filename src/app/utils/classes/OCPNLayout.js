
class OCPNLayout {
    static PLACE_TYPE = 0;
    static TRANSITION_TYPE = 1;
    static DUMMY_TYPE = 2;

    constructor(ocpn, config) {
        this.vertices = {};
        this.arcs = {};
        this.layering = [];
        this.objectTypes = ocpn.objectTypes; // TODO filter only user included subset.

        ocpn.places.forEach(place => {
            this.vertices[place.id] = {
                name: place.name,
                objectType: place.objectType,
                x: undefined,
                y: undefined,
                layer: -1,
                pos: -1,
                type: OCPNLayout.PLACE_TYPE
            };
        });

        ocpn.transitions.forEach(transition => {
            this.vertices[transition.id] = {
                name: transition.name,
                label: transition.label,
                x: undefined,
                y: undefined,
                layer: -1,
                pos: -1,
                type: OCPNLayout.TRANSITION_TYPE
            };
        });

        ocpn.arcs.forEach(arc => {
            this.arcs[arc.id] = {
                source: arc.source.id, // It holds source.layer < target.layer due to setArcDirection().
                target: arc.target.id,
                reversed: false,
                path: [], // The path will contain the ids of the dummy vertices.
                minLayer: -1,
                maxLayer: -1,
                type1: false,
                original: true,
            };
        });
    }

    setArcDirection(arcId, reversed) {
        this.arcs[arcId].reversed = reversed;
        if (reversed) {
            const tmp = this.arcs[arcId].source;
            this.arcs[arcId].source = this.arcs[arcId].target;
            this.arcs[arcId].target = tmp;
        }
    }


    getAllArcsBetweenRanks(lowerRank) {
        if (lowerRank + 1 >= this.layering.length) return [];

        const upperRank = lowerRank + 1;
        const arcs = [];
        Object.values(this.arcs).forEach(arc => {
            if (arc.original) {
                if (arc.path.length > 0) {
                    // Arc has to be split into multiple arcs.
                    if (arc.minLayer <= lowerRank && upperRank <= arc.maxLayer) {
                        let lDiff = lowerRank - arc.minLayer;
                        let uDiff = arc.maxLayer - upperRank;
                        let source = lDiff === 0 ? arc.source : arc.path[lDiff - 1];
                        let target = uDiff === 0 ? arc.target : arc.path[lDiff];
                        arcs.push(
                            {
                                source: source,
                                target: target,
                            });
                    }
                } else {
                    // Arc is not split.
                    if (arc.minLayer === lowerRank && arc.maxLayer === upperRank) {
                        arcs.push(
                            {
                                source: arc.source,
                                target: arc.target,
                            });
                    }
                }
            }
        });
        return arcs;
    }

    getUpperNeighbors(vertexId) {
        const vertex = this.vertices[vertexId];
        const neighbors = [];
        if (vertex.type === OCPNLayout.DUMMY_TYPE) {
            let arc = this.arcs[vertex.belongsTo];
            // arc.path.length > 0
            let idx = arc.path.indexOf(vertexId);
            // Path is sorted by ascending layer.
            let upper = idx === 0 ? arc.source : arc.path[idx - 1];
            return [upper];
        } else {
            Object.values(this.arcs).forEach(arc => {
                if (arc.original) {
                    if (arc.path.length == 0) {
                        if (arc.target === vertexId) {
                            neighbors.push(arc.source);
                        }
                    } else {
                        // Since vertex is not a dummy, it can only be the target of the arc.
                        if (arc.target === vertexId) {
                            let idx = arc.path.length - 1;
                            neighbors.push(arc.path[idx]);
                        }
                    }
                }
            });
        }
        return neighbors;
    }

    getLowerNeighbors(vertexId) {
        const vertex = this.vertices[vertexId];
        const neighbors = [];
        if (vertex.type === OCPNLayout.DUMMY_TYPE) {
            let arc = this.arcs[vertex.belongsTo];
            // arc.path.length > 0
            let idx = arc.path.indexOf(vertexId);
            // Path is sorted by ascending layer.
            let lower = idx === arc.path.length - 1 ? arc.target : arc.path[idx + 1];
            return [lower];
        } else {
            Object.values(this.arcs).forEach(arc => {
                if (arc.original) {
                    if (arc.path.length == 0) {
                        if (arc.source === vertexId) {
                            neighbors.push(arc.target);
                        }
                    } else {
                        // Since vertex is not a dummy, it can only be the source of the arc.
                        if (arc.source === vertexId) {
                            neighbors.push(arc.path[0]);
                        }
                    }
                }
            });
        }
        return neighbors;
    }

    getArcsBetween(sourceId, targetId) {
        // maximal 2 arcs if one of the arcs was reversed.
        const arcs = [];
        Object.values(this.arcs).forEach(arc => {
            if (arc.source === sourceId && arc.target === targetId) {
                arcs.push(arc);
            }
        });
        return arcs;
    }
}

export default OCPNLayout;