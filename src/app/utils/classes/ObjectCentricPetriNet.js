// import { Parser } from 'xml2js';
const { Parser } = require('xml2js');

/**
 * The ObjectCentricPetriNet class represents an object-centric Petri net.
 * Adapted from https://github.com/ocpm/ocpa/blob/main/ocpa/objects/oc_petri_net/obj.py
 */
class ObjectCentricPetriNet {
    /**
     * Class constants.
     */
    static DEFAULT_OCPN_NAME = "Object-Centric Petri Net"; // Default name of the Petri net.
    static DEFAULT_ARC_WEIGHT = 1; // Default weight of an arc.
    static DEFAULT_ARC_VARIABLE = false; // Default variable property of an arc.
    static DEFAULT_ARC_REVERSED = false; // Default reversed property of an arc.

    /**
     * Constructor for the ObjectCentricPetriNet class.
     * 
     * @param {string} name The name of the Petri net.
     * @param {*} places The set of places in the Petri net.
     * @param {*} transitions The set of transitions in the Petri net.
     * @param {*} dummyNodes The set of dummy nodes in the Petri net.
     * @param {*} arcs The set of arcs in the Petri net.
     * @param {Object} objectTypes The Petri nets of projected object types within the Petri net.
     * @param {Object} properties Additional properties of the Petri net.
     */
    constructor(name = "", places = [], transitions = [], dummyNodes = [], arcs = [], objectTypes = {}, properties = {}) {
        this.name = name;
        this.places = places;
        this.transitions = transitions;
        this.dummyNodes = dummyNodes;
        this.arcs = arcs;
        this.objectTypes = objectTypes;
        this.properties = properties;
    }

    /**
     * Finds and returns a place, transition, or dummy node by its unique name.
     *
     * @param {string} name The unique name of the place, transition, or dummy node.
     * @returns {Object|null} The element with the given name, or null if it does not exist.
     */
    findElementByName(name) {
        for (let place of this.places) {
            if (place.name === name) {
                return place;
            }
        }
        for (let transition of this.transitions) {
            if (transition.name === name) {
                return transition;
            }
        }
        for (let dummy of this.dummyNodes) {
            if (dummy.name === name) {
                return dummy;
            }
        }
        return null;
    }

    /**
     * Gets the nodes of the OCPN.
     *
     * @returns The set of node names in the OCPN.
     */
    getNodeIds() {
        var nodes = [];
        for (var p of this.places) {
            nodes.push(p.name);
        }
        for (var t of this.transitions) {
            nodes.push(t.name);
        }
        return nodes;
    }

    /**
     * Gets the arcs of the OCPN.
     * 
     * @returns The arcs of the OCPN.
     */
    getArcs() {
        var as = [];
        for (var arc of this.arcs) {
            as.push({ source: arc.source.name, target: arc.target.name });
        }
        return as;
    }

    /**
     * Deletes the given arc from the OCPN.
     * @param {ObjectCentricPetriNet.Arc} arc 
     */
    deleteArc(arc) {
        this.arcs = this.arcs.filter(a => a !== arc);
        arc.source.outArcs = arc.source.outArcs.filter(a => a !== arc);
        arc.target.inArcs = arc.target.inArcs.filter(a => a !== arc);
    }

    /**
     * Gets JSON object and returns an ObjectCentricPetriNet instance.
     * 
     * @param {Object} json The JSON object to parse.
     * @returns {ObjectCentricPetriNet} The ObjectCentricPetriNet instance.
     */
    static fromJSON(json) {
        const places = json.places.map(place => new ObjectCentricPetriNet.Place(
            place.name,
            place.objectType,
            [],
            [],
            place.initial !== undefined ? place.initial : false,
            place.final !== undefined ? place.final : false
        ));

        const transitions = json.transitions.map(transition => new ObjectCentricPetriNet.Transition(
            transition.name,
            transition.label,
            [],
            [],
            transition.properties !== undefined ? transition.properties : {},
            transition.silent !== undefined ? transition.silent : false
        ));

        const arcs = json.arcs.map(arc => {
            const source = Array.from(places).find(place => place.name === arc.source) ||
                Array.from(transitions).find(transition => transition.name === arc.source);
            const target = Array.from(places).find(place => place.name === arc.target) ||
                Array.from(transitions).find(transition => transition.name === arc.target);

            return new ObjectCentricPetriNet.Arc(
                source,
                target,
                this.DEFAULT_ARC_REVERSED,
                arc.variable !== undefined ? arc.variable : this.DEFAULT_ARC_VARIABLE,
                arc.weight !== undefined ? arc.weight : this.DEFAULT_ARC_WEIGHT,
                arc.properties !== undefined ? arc.properties : {}
            );
        });

        // Add arcs to places and transitions.
        for (const arc of arcs) {
            arc.source.outArcs.push(arc);
            arc.target.inArcs.push(arc);
        }

        // Get the object types of the places.
        const objectTypes = new Set(places.map(place => place.objectType));

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            json.name !== undefined ? json.name : self.DEFAULT_OCPN_NAME, // The name of the Petri net.
            places,  // The set of places in the Petri net.
            transitions, // The set of transitions in the Petri net.
            [], // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs, // The set of arcs in the Petri net.
            objectTypes, // TODO: instead of passing the object types, we return a list of simple Petri Nets based on their object type.
            json.properties !== undefined ? json.properties : {} // Additional properties of the Petri net.
        );
    }

    /**
     * Parses a PNML file and returns an ObjectCentricPetriNet instance.
     * 
     * @param {string} pnml The PNML string to parse.
     * @returns {Promise<ObjectCentricPetriNet>} A promise that resolves to the ObjectCentricPetriNet instance.
     */
    static async fromPNML(pnml) {
        const parser = new Parser();
        const result = await parser.parseStringPromise(pnml);
        const net = result.pnml.net[0];
        const name = net.name[0].text[0] ? net.name[0].text[0] : self.DEFAULT_OCPN_NAME;
        const properties = {}; // Add any additional properties if needed

        const places = net.page[0].place.map(place => {
            const id = place.$.id;
            const objectType = place.toolspecific[0].objectType[0];
            const initial = place.toolspecific[0].initial[0] === 'true';
            const final = place.toolspecific[0].final[0] === 'true';
            return new ObjectCentricPetriNet.Place(id, objectType, [], [], initial, final);
        });

        const transitions = net.page[0].transition.map(transition => {
            const id = transition.$.id;
            const label = transition.name[0].text[0];
            const silent = transition.toolspecific[0].silent[0] === 'true';
            const properties = {}; // TODO
            return new ObjectCentricPetriNet.Transition(id, label, [], [], properties, silent);
        });

        const arcs = net.page[0].arc.map(arc => {
            const source = Array.from(places).find(place => place.name === arc.$.source) ||
                Array.from(transitions).find(transition => transition.name === arc.$.source);
            const target = Array.from(places).find(place => place.name === arc.$.target) ||
                Array.from(transitions).find(transition => transition.name === arc.$.target);
            const weight = arc.inscription ? parseInt(arc.inscription[0].text[0], 10) : 1;
            const variable = arc.toolspecific[0].variableArc[0] === 'true';
            const properties = {}; // TODO
            return new ObjectCentricPetriNet.Arc(source, target, false, variable, weight, properties);
        });

        // Add arcs to places and transitions.
        for (const arc of arcs) {
            arc.source.outArcs.push(arc);
            arc.target.inArcs.push(arc);
        }

        // Get the object types of the OCPN.
        const objectTypes = new Set(places.map(place => place.objectType));

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            name,
            places,
            transitions,
            [], // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs,
            objectTypes,
            properties
        );
    }

    /**
     * Check for equality of two OCPNs, except the name and properties.
     * 
     * @param {ObjectCentricPetriNet} other The other OCPN to compare with.
     * @returns {boolean} True if the OCPNs are equal, false otherwise.
     */
    equals(other) {
        if (this.places.size !== other.places.size) return false;
        if (this.transitions.size !== other.transitions.size) return false;
        if (this.arcs.size !== other.arcs.size) return false;

        const compareSets = (set1, set2, compareFunc) => {
            if (set1.size !== set2.size) return false;
            for (const item1 of set1) {
                if (![...set2].some(item2 => compareFunc(item1, item2))) return false;
            }
            return true;
        }

        const comparePlaces = (p1, p2) =>
            p1.name === p2.name &&
            p1.objectType === p2.objectType &&
            p1.initial === p2.initial &&
            p1.final === p2.final;
        const compareTransitions = (t1, t2) =>
            t1.name === t2.name &&
            t1.label === t2.label &&
            t1.silent === t2.silent;
        const compareArcs = (a1, a2) =>
            a1.source.name === a2.source.name &&
            a1.target.name === a2.target.name &&
            a1.reversed === a2.reversed &&
            a1.variable === a2.variable &&
            a1.weight === a2.weight;

        if (!compareSets(this.places, other.places, comparePlaces)) return false;
        console.log("Places are equal");
        if (!compareSets(this.transitions, other.transitions, compareTransitions)) return false;
        console.log("Transitions are equal");
        if (!compareSets(this.arcs, other.arcs, compareArcs)) return false;
        console.log("Arcs are equal");
        return true;
    }

    /**
     * Converts the OCPN to a string representation.
     * 
     * @returns {string} The string representation of the OCPN.
     */
    toString() {
        const placesStr = Array.from(this.places).map(place => place.toString()).join('');
        const transitionsStr = Array.from(this.transitions).map(transition => transition.toString()).join('');
        const dummyNodesStr = Array.from(this.dummyNodes).map(dummyNode => dummyNode.toString()).join('');
        const arcsStr = Array.from(this.arcs).map(arc => arc.toString()).join('');
        const propertiesStr = Object.entries(this.properties)
            .map(([key, value]) => `\t${key}: ${value}`)
            .join('\n');

        return `${this.name}\nPlaces:\n${placesStr}\nTransitions:\n${transitionsStr}\nDummy Nodes:\n${dummyNodesStr ? dummyNodesStr : "\tNo dummy Nodes yet!"}\nArcs:\n${arcsStr}\nProperties:\n${propertiesStr}`;
    }
}

ObjectCentricPetriNet.Place = class {
    /**
     * The constructor for the Place class.
     * 
     * @param {*} name The name of the place
     * @param {*} objectType The object type the place belongs to.
     * @param {*} outArcs The set of arcs that have the place as source
     * @param {*} inArcs The set of arcs that have the place as target
     * @param {*} initial Boolean that determines whether the place is a source place
     * @param {*} final Boolean that determines whether the place is a sink place
     */
    constructor(name, objectType, outArcs = [], inArcs = [], initial = false, final = false) {
        this.name = name;
        this.objectType = objectType;
        this.initial = initial;
        this.final = final;
        this.inArcs = inArcs;
        this.outArcs = outArcs;
    }

    /**
     * Converts the place to a string representation.
     * 
     * @returns {string} The string representation of the place.
     */
    toString() {
        return `\tName: ${this.name}, ObjectType: ${this.objectType}\n`;
    }
};

ObjectCentricPetriNet.Transition = class {
    /**
     * Constructor for the Transition class.
     * 
     * @param {*} name The name of the transition.
     * @param {*} label The label of the transition.
     * @param {*} inArcs The set of arcs that have the transition as target.
     * @param {*} outArcs The set of arcs that have the transition as source.
     * @param {*} properties Additional properties of the transition.
     * @param {*} silent Boolean that determines whether the transition is silent.
     */
    constructor(name, label = null, inArcs = [], outArcs = [], properties = {}, silent = false) {
        this.name = name;
        this.label = label;
        this.inArcs = inArcs;
        this.outArcs = outArcs;
        this.silent = silent;
        this.properties = properties;
    }

    /**
     * Converts the transition to a string representation.
     * 
     * @returns {string} The string representation of the transition.
     */
    toString() {
        return `\tName: ${this.name}, Label: ${this.label}\n`;
    }
};

ObjectCentricPetriNet.Arc = class {
    /**
     * Constructor for the Arc class.
     * 
     * @param {*} source The source of the arc.
     * @param {*} target The target of the arc.
     * @param {*} reversed Boolean that indicates whether the arc is reversed.
     * @param {*} variable Boolean that determines whether the arc is a variable arc.
     * @param {*} weight The weight of the arc.
     * @param {*} properties Additional properties of the arc.
     */
    constructor(source, target, reversed = false, variable = false, weight = 1, properties = {}) {
        if ((source instanceof ObjectCentricPetriNet.Place && target instanceof ObjectCentricPetriNet.Place) ||
            (source instanceof ObjectCentricPetriNet.Transition && target instanceof ObjectCentricPetriNet.Transition)) {
            throw new Error('Petri nets are bipartite graphs!');
        }
        this.source = source;
        this.target = target;
        this.reversed = reversed;
        this.weight = weight;
        this.variable = variable;
        this.properties = properties;
    }

    /**
     * Sets the reversed property of the arc.
     * 
     * @param {boolean} reversed The new value of the reversed property.
     */
    setReverse(reversed) {
        this.reversed = reversed;
    }

    /**
     * Converts the arc to a string representation.
     * 
     * @returns {string} The string representation of the arc.
     */
    toString() {
        return `\t${this.source.name} -> ${this.target.name}`;
    }
};

ObjectCentricPetriNet.Dummy = class {
    /**
     * Constructor for the Dummy Node class.
     * 
     * @param {*} name The name of the dummy node.
     * @param {*} from The node from which the dummy node receives an arc.
     * @param {*} to The node to which the dummy node sends an arc.
     * @param {*} layer The layer in which the dummy node is placed.
     * @param {Boolean} arcReversed Boolean that determines whether the corresponding arc is reversed.
     */
    constructor(name, from, to, layer, arcReversed = false) {
        this.name = name;
        this.from = from;
        this.to = to;
        this.layer = layer;
        this.arcReversed = arcReversed;
    }

    toString() {
        return `\tName: ${this.name}\n`;
    }
}

// Export the ObjectCentricPetriNet class and its subclasses
// export default ObjectCentricPetriNet;
module.exports = ObjectCentricPetriNet;
