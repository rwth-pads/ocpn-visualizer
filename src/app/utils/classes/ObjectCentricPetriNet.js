const fs = require('fs');
const xml2js = require('xml2js');

/**
 * The ObjectCentricPetriNet class represents an object-centric Petri net.
 * Adapted from https://github.com/ocpm/ocpa/blob/main/ocpa/objects/oc_petri_net/obj.py
 */
class ObjectCentricPetriNet {
    /**
     * Constructor for the ObjectCentricPetriNet class.
     * 
     * @param {string} name The name of the Petri net.
     * @param {Set} places The set of places in the Petri net.
     * @param {Set} transitions The set of transitions in the Petri net.
     * @param {Set} dummyNodes The set of dummy nodes in the Petri net.
     * @param {Set} arcs The set of arcs in the Petri net.
     * @param {Object} objectTypes The Petri nets of projected object types within the Petri net.
     * @param {Object} properties Additional properties of the Petri net.
     */
    constructor(name = "", places = new Set(), transitions = new Set(), dummyNodes = new Set(), arcs = new Set(), objectTypes = {}, properties = {}) {
        this.name = name;
        this.places = places;
        this.transitions = transitions;
        this.dummyNodes = dummyNodes;
        this.arcs = arcs;
        this.objectTypes = objectTypes;
        this.properties = properties;
    }

    /**
     * Class constants.
     */
    static DEFAULT_OCPN_NAME = "Object-Centric Petri Net"; // Default name of the Petri net.
    static DEFAULT_ARC_WEIGHT = 1; // Default weight of an arc.
    static DEFAULT_ARC_VARIABLE = false; // Default variable property of an arc.
    static DEFAULT_ARC_REVERSED = false; // Default reversed property of an arc.

    /**
     * Adds an arc to the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Arc} arc The arc to add to the Petri net.
     */
    addArc(arc) {
        this.arcs.add(arc);
        arc.source.outArcs.add(arc);
        arc.target.inArcs.add(arc);
    }

    /**
     * Adds multiple arcs to the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Arc[]} arcs The list of arcs to add to the Petri net.
     */
    addArcs(arcs) {
        for (const arc of arcs) {
            this.addArc(arc);
        }
    }

    /**
     * Removes an arc from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Arc} arc The arc to remove from the Petri net.
     */
    removeArc(arc) {
        this.arcs.delete(arc);
        arc.source.outArcs.delete(arc);
        arc.target.inArcs.delete(arc);
    }

    /**
     * Removes multiple arcs from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Arc[]} arcs The list of arcs to remove from the Petri net.
     */
    removeArcs(arcs) {
        for (const arc of arcs) {
            this.removeArc(arc);
        }
    }

    /**
     * Removes a place from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Place} place The place to remove from the Petri net.
     */
    removePlace(place) {
        this.places.delete(place);
        const removeArcs = new Set();
        for (const arc of this.arcs) {
            if (arc.source === place || arc.target === place) {
                removeArcs.add(arc);
            }
        }
        this.removeArcs(removeArcs);
    }

    /**
     * Removes multiple places from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Place[]} places The list of places to remove from the Petri net.
     */
    removePlaces(places) {
        for (const place of places) {
            this.removePlace(place);
        }
    }

    /**
     * Removes a transition from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Transition} transition The transition to remove from the Petri net.
     */
    removeTransition(transition) {
        this.transitions.delete(transition);
        const removeArcs = new Set();
        for (const arc of this.arcs) {
            if (arc.source === transition || arc.target === transition) {
                removeArcs.add(arc);
            }
        }
        this.removeArcs(removeArcs);
    }

    /**
     * Removes multiple transitions from the Petri net.
     * 
     * @param {ObjectCentricPetriNet.Transition[]} transitions The list of transitions to remove from the Petri net.
     */
    removeTransitions(transitions) {
        for (const transition of transitions) {
            this.removeTransition(transition);
        }
    }

    /**
     * Gets JSON object and returns an ObjectCentricPetriNet instance.
     * 
     * @param {Object} json The JSON object to parse.
     * @returns {ObjectCentricPetriNet} The ObjectCentricPetriNet instance.
     */
    static fromJSON(json) {
        const places = new Set(json.places.map(place => new ObjectCentricPetriNet.Place(
            place.name,
            place.objectType,
            new Set(),
            new Set(),
            place.initial !== undefined ? place.initial : false,
            place.final !== undefined ? place.final : false
        )));

        const transitions = new Set(json.transitions.map(transition => new ObjectCentricPetriNet.Transition(
            transition.name,
            transition.label,
            new Set(),
            new Set(),
            transition.properties !== undefined ? transition.properties : {},
            transition.silent !== undefined ? transition.silent : false
        )));

        const arcs = new Set(json.arcs.map(arc => {
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
        }));

        // Add arcs to places and transitions.
        for (const arc of arcs) {
            arc.source.outArcs.add(arc);
            arc.target.inArcs.add(arc);
        }

        // Get the object types of the places.
        const objectTypes = new Set(Array.from(places).map(place => place.objectType));

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            json.name !== undefined ? json.name : self.DEFAULT_OCPN_NAME, // The name of the Petri net.
            places,  // The set of places in the Petri net.
            transitions, // The set of transitions in the Petri net.
            new Set(), // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs, // The set of arcs in the Petri net.
            objectTypes, // TODO: instead of passing the object types, we return a list of simple Petri Nets based on their object type.
            json.properties !== undefined ? json.properties : {} // Additional properties of the Petri net.
        );
    }

    /**
     * Parses a PNML file and returns an ObjectCentricPetriNet instance.
     * 
     * @param {string} pnmlFilePath The path to the PNML file.
     * @returns {Promise<ObjectCentricPetriNet>} A promise that resolves to the ObjectCentricPetriNet instance.
     */
    static async fromPNML(pnmlFilePath) {
        const parser = new xml2js.Parser();
        const data = fs.readFileSync(pnmlFilePath, 'utf8');
        const result = await parser.parseStringPromise(data);

        const net = result.pnml.net[0];
        const name = net.name[0].text[0];
        const properties = {}; // Add any additional properties if needed

        const places = new Set(net.page[0].place.map(place => {
            const id = place.$.id;
            const objectType = place.toolspecific[0].objectType[0];
            const initial = place.toolspecific[0].initial[0] == 'true';
            const final = place.toolspecific[0].final[0] == 'true';
            return new ObjectCentricPetriNet.Place(id, objectType, new Set(), new Set(), initial, final);
        }));

        const transitions = new Set(net.page[0].transition.map(transition => {
            const id = transition.$.id;
            const label = transition.name[0].text[0];
            const silent = transition.toolspecific[0].silent[0] === 'true';
            const properties = {}; // TODO
            return new ObjectCentricPetriNet.Transition(id, label, new Set(), new Set(), properties, silent);
        }));

        const arcs = new Set(net.page[0].arc.map(arc => {
            const source = Array.from(places).find(place => place.name === arc.$.source) ||
                Array.from(transitions).find(transition => transition.name === arc.$.source);
            const target = Array.from(places).find(place => place.name === arc.$.target) ||
                Array.from(transitions).find(transition => transition.name === arc.$.target);
            const weight = arc.inscription ? parseInt(arc.inscription[0].text[0], 10) : 1;
            const variable = arc.toolspecific[0].variableArc[0] === 'true';
            const properties = {}; // TODO
            return new ObjectCentricPetriNet.Arc(source, target, false, variable, weight, properties);
        }));

        // Add arcs to places and transitions.
        for (const arc of arcs) {
            arc.source.outArcs.add(arc);
            arc.target.inArcs.add(arc);
        }

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            name,
            places,
            transitions,
            new Set(), // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs,
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
    constructor(name, objectType, outArcs = new Set(), inArcs = new Set(), initial = false, final = false) {
        this.name = name;
        this.objectType = objectType;
        this.initial = initial;
        this.final = final;
        this.inArcs = inArcs;
        this.outArcs = outArcs;
    }

    /**
     * Returns the preset of this place.
     * The preset of a place is the set of places that have arcs to this place.
     * 
     * @returns {Set} The preset of the place.
     */
    get preset() {
        return new Set(Array.from(this.inArcs).map(inArc => inArc.source));
    }

    /**
     * Returns the postset of this place.
     * The postset of a place is the set of places that have arcs from this place.
     * 
     * @returns {Set} The postset of the place.
     */
    get postset() {
        return new Set(Array.from(this.outArcs).map(outArc => outArc.target));
    }

    /**
     * Converts the place to a string representation.
     * 
     * @returns {string} The string representation of the place.
     */
    toString() {
        return `\tName: ${this.name}, ObjectType: ${this.objectType}${this.initial ? "\t(source)" : ""}${this.final ? "\t(sink)" : ""}\n`;
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
    constructor(name, label = null, inArcs = new Set(), outArcs = new Set(), properties = {}, silent = false) {
        this.name = name;
        this.label = label;
        this.inArcs = inArcs;
        this.outArcs = outArcs;
        this.silent = silent;
        this.properties = properties;
    }

    /**
     * Gets the set of source nodes for the incoming arcs.
     * 
     * @returns {Set} A set containing the source nodes of all incoming arcs.
     */
    get preset() {
        return new Set(Array.from(this.inArcs).map(inArc => inArc.source));
    }

    /**
     * Gets the set of target nodes for the outgoing arcs.
     * 
     * @returns {Set} A set containing the target nodes of the outgoing arcs.
     */
    get postset() {
        return new Set(Array.from(this.outArcs).map(outArc => outArc.target));
    }

    /**
     * Converts the transition to a string representation.
     * 
     * @returns {string} The string representation of the transition.
     */
    toString() {
        return `\tName: ${this.name}, Label: ${this.label}${this.silent ? "\t(silent)" : ""}\n`;
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
        if (source.constructor === target.constructor) {
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
     * Reverses the arc.
     */
    reverseArc() {
        const newArc = new ObjectCentricPetriNet.Arc(this.target, this.source, !this.reversed, this.variable, this.weight, this.properties);
        this.source.outArcs.delete(this);
        this.target.inArcs.delete(this);
        this.source = newArc.source;
        this.target = newArc.target;
        this.source.outArcs.add(newArc);
        this.target.inArcs.add(newArc);
    }

    /**
     * Converts the arc to a string representation.
     * 
     * @returns {string} The string representation of the arc.
     */
    toString() {
        return `\t${this.source.name} -> ${this.target.name}${this.reversed ? "\t(Reversed)" : ""}${this.variable ? "\t(Variable Arc)" : ""}\n`;
    }
};

ObjectCentricPetriNet.Dummy = class {
    /**
     * Constructor for the Dummy Node class.
     * 
     * @param {*} name The name of the dummy node.
     * @param {*} objectType The object type of the dummy node, depending on the object tpye of the connected place.
     * @param {*} inArcs The node from which the dummy node receives an arc. |inArcs| = 1 for all dummy nodes.
     * @param {*} outArcs The node to which the dummy node sends an arc. |outArcs| = 1 for all dummy nodes.
     */
    constructor(name, objectType, inArcs, outArcs) {
        this.name = name;
        this.objectType = objectType;
        this.inArcs = inArcs;
        this.outArcs = outArcs;
    }

    /**
     * Returns whether the dummy node is an outer dummy node.
     * A dummy node is an outer dummy node if either the 'from' or the 'to' node are not a dummy nodes, hence a place or a transition.
     * 
     * @returns {boolean} True if the dummy node is an outer dummy node, false otherwise.
     */
    isOuterDummy() {
        // |inArcs| = 1 and |outArcs| = 1 for all dummy nodes.
        return !(this.inArcs[0] instanceof ObjectCentricPetriNet.Dummy) || !(this.outArcs[0] instanceof ObjectCentricPetriNet.Dummy);
    }

    /**
     * Converts the dummy node to a string representation.
     * 
     * @returns {string} The string representation of the dummy node.
     */
    toString() {
        return `\tDummy: ${this.inArcs[0].source.name} -> ${this.outArcs[0].target.name}\n`;
    }
}

// Export the ObjectCentricPetriNet class and its subclasses
module.exports = ObjectCentricPetriNet;
