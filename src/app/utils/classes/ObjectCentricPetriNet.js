import { Parser } from 'xml2js';
import OCPNLayout from './OCPNLayout';

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

    static placeCounter = 0; // Static counter for generating unique place ids.
    static transitionCounter = 0; // Static counter for generating unique transition ids.
    static dummyCounter = 0; // Static counter for generating unique dummy node ids.
    static arcCounter = 0; // Static counter for generating unique arc ids.

    static generatePlaceId() {
        return `place_${ObjectCentricPetriNet.placeCounter++}`;
    }

    static generateTransitionId() {
        return `transition_${ObjectCentricPetriNet.transitionCounter++}`;
    }

    static generateDummyId() {
        return `dummy_${ObjectCentricPetriNet.dummyCounter++}`;
    }

    static generateArcId() {
        return `arc_${ObjectCentricPetriNet.arcCounter++}`;
    }

    /**
     * Constructor for the ObjectCentricPetriNet class.
     * 
     * @param {string} name The name of the Petri net.
     * @param {*} places The set of places in the Petri net.
     * @param {*} transitions The set of transitions in the Petri net.
     * @param {*} dummyNodes The set of dummy nodes in the Petri net.
     * @param {*} arcs The set of arcs in the Petri net.
     * @param {*} objectTypes The Petri nets of projected object types within the Petri net.
     * @param {Object} properties Additional properties of the Petri net.
     */
    constructor(name = "", places = [], transitions = [], dummyNodes = [], arcs = [], objectTypes = [], properties = {}) {
        this.name = name;
        this.places = places;
        this.transitions = transitions;
        this.dummyNodes = dummyNodes;
        this.arcs = arcs;
        this.objectTypes = objectTypes;
        this.properties = properties;
        this.layout = null;
    }

    /**
     * Gets the nodes of the OCPN.
     *
     * @returns The set of node names in the OCPN.
     */
    getNodeIds() {
        var nodes = [];
        for (var vId in this.layout.vertices) {
            // console.log(vId);
            nodes.push(vId);
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
        for (var arcId in this.layout.arcs) {
            let arc = this.layout.arcs[arcId];
            let rev = arc.reversed;
            let upper = arc.source;
            let lower = arc.target;
            as.push({ source: upper, target: lower, reversed: rev });
        }
        return as;
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
            // Add the adjacentObjectTypes to the transitions.
            if (arc.source instanceof ObjectCentricPetriNet.Transition) {
                arc.source.adjacentObjectTypes.add(arc.target.objectType);
            } else if (arc.target instanceof ObjectCentricPetriNet.Transition) {
                arc.target.adjacentObjectTypes.add(arc.source.objectType);
            }
        }

        // Get the object types of the places.
        const objectTypes = [...new Set(places.map(place => place.objectType))];

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
            // Add the adjacentObjectTypes to the transitions.
            if (arc.source instanceof ObjectCentricPetriNet.Transition) {
                arc.source.adjacentObjectTypes.add(arc.target.objectType);
            } else if (arc.target instanceof ObjectCentricPetriNet.Transition) {
                arc.target.adjacentObjectTypes.add(arc.source.objectType);
            }
        }

        // Get the object types of the OCPN.
        const objectTypes = [...new Set(places.map(place => place.objectType))];

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            name,
            places,
            transitions,
            [], // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs,
            objectTypes,
            properties,
        );
    }

    static Place = class {
        /**
         * The constructor for the Place class.
         * 
         * @param {string} id The unique id of the place.
         * @param {*} name The name of the place
         * @param {*} objectType The object type the place belongs to.
         * @param {*} outArcs The set of arcs that have the place as source
         * @param {*} inArcs The set of arcs that have the place as target
         * @param {*} initial Boolean that determines whether the place is a source place
         * @param {*} final Boolean that determines whether the place is a sink place
         */
        constructor(name, objectType, outArcs = [], inArcs = [], initial = false, final = false) {
            this.id = ObjectCentricPetriNet.generatePlaceId();
            this.name = name;
            this.objectType = objectType;
            this.initial = initial;
            this.final = final;
            this.inArcs = inArcs;
            this.outArcs = outArcs;
            this.layer = -1;
            this.pos = -1;
            this.x = undefined;
            this.y = undefined;
        }
    };

    static Transition = class {
        /**
         * Constructor for the Transition class.
         * 
         * @param {string} id The unique id of the transition.
         * @param {*} name The name of the transition.
         * @param {*} label The label of the transition.
         * @param {*} inArcs The set of arcs that have the transition as target.
         * @param {*} outArcs The set of arcs that have the transition as source.
         * @param {*} properties Additional properties of the transition.
         * @param {*} silent Boolean that determines whether the transition is silent.
         * @param {*} adjacentObjectTypes The object types adjacent to the transition.
         */
        constructor(name, label = null, inArcs = [], outArcs = [], properties = {}, silent = false, adjacentObjectTypes = new Set()) {
            this.id = ObjectCentricPetriNet.generateTransitionId();
            this.name = name;
            this.label = label;
            this.inArcs = inArcs;
            this.outArcs = outArcs;
            this.silent = silent;
            this.adjacentObjectTypes = adjacentObjectTypes;
            this.layer = -1;
            this.pos = -1;
            this.x = undefined;
            this.y = undefined;
            this.properties = properties;
        }
    };

    static Arc = class {
        /**
         * Constructor for the Arc class.
         * 
         * @param {string} id The unique id of the arc.
         * @param {*} source The source of the arc.
         * @param {*} target The target of the arc.
         * @param {*} reversed Boolean that indicates whether the arc is reversed. TODO: moved to OCPNLayout
         * @param {*} variable Boolean that determines whether the arc is a variable arc.
         * @param {*} weight The weight of the arc.
         * @param {*} properties Additional properties of the arc.
         */
        constructor(source, target, reversed = false, variable = false, weight = 1, properties = {}) {
            if ((source instanceof ObjectCentricPetriNet.Place && target instanceof ObjectCentricPetriNet.Place) ||
                (source instanceof ObjectCentricPetriNet.Transition && target instanceof ObjectCentricPetriNet.Transition)) {
                throw new Error('Petri nets are bipartite graphs!');
            }
            this.id = ObjectCentricPetriNet.generateArcId();
            this.source = source;
            this.target = target;
            this.reversed = reversed;
            this.weight = weight;
            this.variable = variable;
            this.properties = properties;
        }
    };
}

// Export the ObjectCentricPetriNet class and its subclasses
export default ObjectCentricPetriNet;