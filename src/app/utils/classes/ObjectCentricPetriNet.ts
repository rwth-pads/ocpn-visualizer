import { Parser } from 'xml2js';
import OCPNLayout from './OCPNLayout';

interface Place {
    id: string;
    name: string;
    objectType: string;
    initial: boolean;
    final: boolean;
    inArcs: Arc[];
    outArcs: Arc[];
    layer: number;
    pos: number;
    x?: number;
    y?: number;
}

interface Transition {
    id: string;
    name: string;
    label: string | null;
    inArcs: Arc[];
    outArcs: Arc[];
    silent: boolean;
    adjacentObjectTypes: Set<string>;
    layer: number;
    pos: number;
    x?: number;
    y?: number;
    properties: Record<string, any>;
}

interface Arc {
    id: string;
    source: Place | Transition;
    target: Place | Transition;
    reversed: boolean;
    variable: boolean;
    weight: number;
    properties: Record<string, any>;
}

interface ObjectCentricPetriNetJSON {
    name?: string;
    places: {
        name: string;
        objectType: string;
        initial?: boolean;
        final?: boolean;
    }[];
    transitions: {
        name: string;
        label: string;
        properties?: Record<string, any>;
        silent?: boolean;
    }[];
    arcs: {
        source: string;
        target: string;
        weight?: number;
        variable?: boolean;
        properties?: Record<string, any>;
    }[];
    properties?: Record<string, any>;
}

class ObjectCentricPetriNet {
    static DEFAULT_OCPN_NAME = "Object-Centric Petri Net";
    static DEFAULT_ARC_WEIGHT = 1;
    static DEFAULT_ARC_VARIABLE = false;
    static DEFAULT_ARC_REVERSED = false;

    static placeCounter = 0;
    static transitionCounter = 0;
    static dummyCounter = 0;
    static arcCounter = 0;

    static generatePlaceId(): string {
        return `place_${ObjectCentricPetriNet.placeCounter++}`;
    }

    static generateTransitionId(): string {
        return `transition_${ObjectCentricPetriNet.transitionCounter++}`;
    }

    static generateDummyId(): string {
        return `dummy_${ObjectCentricPetriNet.dummyCounter++}`;
    }

    static generateArcId(): string {
        return `arc_${ObjectCentricPetriNet.arcCounter++}`;
    }

    name: string;
    places: Place[];
    transitions: Transition[];
    dummyNodes: any[];
    arcs: Arc[];
    objectTypes: string[];
    properties: Record<string, any>;
    layout: OCPNLayout | null;

    constructor(
        name = "",
        places: Place[] = [],
        transitions: Transition[] = [],
        dummyNodes: any[] = [],
        arcs: Arc[] = [],
        objectTypes: string[] = [],
        properties: Record<string, any> = {}
    ) {
        this.name = name;
        this.places = places;
        this.transitions = transitions;
        this.dummyNodes = dummyNodes;
        this.arcs = arcs;
        this.objectTypes = objectTypes;
        this.properties = properties;
        this.layout = null;
    }

    getNodeIds(): string[] {
        const nodes: string[] = [];
        if (this.layout) {
            for (const vId in this.layout.vertices) {
                nodes.push(vId);
            }
        }
        return nodes;
    }

    getArcs(): { source: string; target: string; reversed: boolean }[] {
        const as: { source: string; target: string; reversed: boolean }[] = [];
        if (this.layout) {
            for (const arcId in this.layout.arcs) {
                const arc = this.layout.arcs[arcId];
                const rev = arc.reversed;
                const upper = arc.source;
                const lower = arc.target;
                as.push({ source: upper, target: lower, reversed: rev });
            }
        }
        return as;
    }

    getPlaceCount(): number {
        return this.places.length;
    }

    getTransitionCount(): number {
        return this.transitions.length;
    }

    getArcCount(): number {
        return this.arcs.length;
    }

    getVariableArcCount(): number {
        return this.arcs.filter(arc => arc.variable).length;
    }

    getObjectTypeCount(): number {
        return this.objectTypes.length;
    }

    getOCPNInfo(): string {
        const placeCount = this.getPlaceCount();
        const transitionCount = this.getTransitionCount();
        const arcCount = this.getArcCount();
        const varArcCount = this.getVariableArcCount();
        const objectTypeCount = this.getObjectTypeCount();
        return `|P|: ${placeCount}, |T|: ${transitionCount}, |F|: ${arcCount}, |F_var|: ${varArcCount}, |OT|: ${objectTypeCount}`;
    }

    static fromJSON(json: ObjectCentricPetriNetJSON): ObjectCentricPetriNet {
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
            const source = places.find(place => place.name === arc.source) ||
                transitions.find(transition => transition.name === arc.source);
            const target = places.find(place => place.name === arc.target) ||
                transitions.find(transition => transition.name === arc.target);

            return new ObjectCentricPetriNet.Arc(
                source!,
                target!,
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
                if (arc.target instanceof ObjectCentricPetriNet.Place) {
                    arc.source.adjacentObjectTypes.add(arc.target.objectType);
                }
            } else if (arc.target instanceof ObjectCentricPetriNet.Transition) {
                if (arc.source instanceof ObjectCentricPetriNet.Place) {
                    arc.target.adjacentObjectTypes.add(arc.source.objectType);
                }
            }
        }

        // Get the object types of the places.
        const objectTypes = Array.from(new Set(places.map(place => place.objectType)));

        // Return the ObjectCentricPetriNet instance.
        return new ObjectCentricPetriNet(
            json.name !== undefined ? json.name : this.DEFAULT_OCPN_NAME, // The name of the Petri net.
            places,  // The set of places in the Petri net.
            transitions, // The set of transitions in the Petri net.
            [], // Dummy nodes will be added within the Sugiyama layout algorithm.
            arcs, // The set of arcs in the Petri net.
            objectTypes, // The set of object types in the Petri net.
            json.properties !== undefined ? json.properties : {} // Additional properties of the Petri net.
        );
    }

    static async fromPNML(pnml: string): Promise<ObjectCentricPetriNet> {
        const parser = new Parser();
        const result = await parser.parseStringPromise(pnml);
        const net = result.pnml.net[0];
        const name = net.name[0].text[0] ? net.name[0].text[0] : this.DEFAULT_OCPN_NAME;
        const properties: Record<string, any> = {}; // Add any additional properties if needed

        const places = net.page[0].place.map((place: any) => {
            const id = place.$.id;
            const objectType = place.toolspecific[0].objectType[0];
            const initial = place.toolspecific[0].initial[0] === 'true';
            const final = place.toolspecific[0].final[0] === 'true';
            return new ObjectCentricPetriNet.Place(id, objectType, [], [], initial, final);
        });

        const transitions = net.page[0].transition.map((transition: any) => {
            const id = transition.$.id;
            const label = transition.name[0].text[0];
            const silent = transition.toolspecific[0].silent[0] === 'true';
            const properties: Record<string, any> = {};
            return new ObjectCentricPetriNet.Transition(id, label, [], [], properties, silent);
        });

        const arcs = net.page[0].arc.map((arc: any) => {
            const source = places.find((place: any) => place.name === arc.$.source) ||
                transitions.find((transition: any) => transition.name === arc.$.source);
            const target = places.find((place: any) => place.name === arc.$.target) ||
                transitions.find((transition: any) => transition.name === arc.$.target);
            const weight = arc.inscription ? parseInt(arc.inscription[0].text[0], 10) : 1;
            const variable = arc.toolspecific[0].variableArc[0] === 'true';
            const properties: Record<string, any> = {};
            return new ObjectCentricPetriNet.Arc(source!, target!, false, variable, weight, properties);
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
        const objectTypes: string[] = Array.from(new Set(places.map((place: any) => place.objectType)));

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
        id: string;
        name: string;
        objectType: string;
        initial: boolean;
        final: boolean;
        inArcs: Arc[];
        outArcs: Arc[];
        layer: number;
        pos: number;
        x?: number;
        y?: number;

        constructor(name: string, objectType: string, outArcs: Arc[] = [], inArcs: Arc[] = [], initial = false, final = false) {
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
        id: string;
        name: string;
        label: string | null;
        inArcs: Arc[];
        outArcs: Arc[];
        silent: boolean;
        adjacentObjectTypes: Set<string>;
        layer: number;
        pos: number;
        x?: number;
        y?: number;
        properties: Record<string, any>;

        constructor(name: string, label: string | null = null, inArcs: Arc[] = [], outArcs: Arc[] = [], properties: Record<string, any> = {}, silent = false, adjacentObjectTypes = new Set<string>()) {
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
        id: string;
        source: Place | Transition;
        target: Place | Transition;
        reversed: boolean;
        variable: boolean;
        weight: number;
        properties: Record<string, any>;

        constructor(source: Place | Transition, target: Place | Transition, reversed = false, variable = false, weight = 1, properties: Record<string, any> = {}) {
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
export type { Place, Transition, Arc };