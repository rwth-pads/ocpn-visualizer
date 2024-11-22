const { type } = require("os");

class OCPNLayout {
    static PLACE_TYPE = 0;
    static TRANSITION_TYPE = 1;
    static DUMMY_TYPE = 2;

    constructor(ocpn) {
        this.vertices = {};
        this.arcs = {};
        this.layering = [];

        ocpn.places.forEach(place => {
            this.vertices[place.id] = {
                name: place.name,
                objecttype: place.objectType,
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
                path: [] // The path will contain the ids of the dummy vertices.
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


    static getAllArcsBetweenRanks(lowerRank, ocpnLayout) {
        if (lowerRank + 1 >= ocpnLayout.layering.length) return [];

        const upperRank = lowerRank + 1;
        const arcs = [];
        ocpnLayout.arcs.forEach(arc => {
            if (arc.path.length > 0) {
                // Arc has to be split into multiple arcs.
                const firstDummy = arc.reversed ? arc.target : arc.source;
                if (ocpnLayout.vertices[firstDummy].layer !== lowerRank) {
                    firstDummy = arc.path.find(dummy => ocpnLayout.vertices[dummy].layer === lowerRank);
                }
                
            } else {
                // Arc is not split.
                let inLower = arc.reversed ? arc.target : arc.source;
                let inUpper = arc.reversed ? arc.source : arc.target;
                if (ocpnLayout.vertices[inLower].layer === lowerRank &&
                    ocpnLayout.vertices[inUpper].layer === upperRank) {
                    arcs.push({ source: inLower, target: inUpper });
                }
            }
        })
        return arcs;
    }
}

// export default OCPNLayout;
module.exports = OCPNLayout;