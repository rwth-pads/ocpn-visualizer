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
     * Parses a JSON object and returns an ObjectCentricPetriNet instance.
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
            json.properties !== undefined ? json.properties : {}, // Additional properties of the Petri net.
            objectTypes // TODO: instead of passing the object types, we return a list of simple Petri Nets based on their object type.
        );
    }

    /**
     * Class constants.
     */
    static DEFAULT_OCPN_NAME = "Object-Centric Petri Net"; // Default name of the Petri net.
    static DEFAULT_ARC_WEIGHT = 1; // Default weight of an arc.
    static DEFAULT_ARC_VARIABLE = false; // Default variable property of an arc.
    static DEFAULT_ARC_REVERSED = false; // Default reversed property of an arc.
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
}

export { ObjectCentricPetriNet };