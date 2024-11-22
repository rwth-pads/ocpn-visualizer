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
                source: arc.source.id,
                target: arc.target.id,
                reversed: false,
                path: [] // The path will contain the ids of the dummy vertices.
            };
        });
    }
}

// export default OCPNLayout;
module.exports = OCPNLayout;