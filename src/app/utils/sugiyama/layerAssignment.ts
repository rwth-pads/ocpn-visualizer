import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
import OCPNGraph from '../classes/OCPNGraph';
import glpkModule, { GLPK } from 'glpk.js';

// Singleton pattern for GLPK instance.
let glpkInstance: GLPK | null = null;

async function getGLPKInstance() {
    if (!glpkInstance) {
        glpkInstance = await glpkModule();
    }
    return glpkInstance;
}

function createILPObjective(arcs: { source: string; target: string; reversed: boolean }[]) {
    const vars = [];
    for (const arc of arcs) {
        // Change coefficient if the arc is reversed.
        vars.push({ name: arc.target, coef: 1 });
        vars.push({ name: arc.source, coef: -1 });
    }
    return combineCoefs(vars);
}

function combineCoefs(vars: { name: string; coef: number }[]) {
    const combCoefs: { [key: string]: number } = {};
    for (const { name, coef } of vars) {
        if (combCoefs[name] !== undefined) {
            combCoefs[name] += coef;
        } else {
            combCoefs[name] = coef;
        }
    }
    return Object.entries(combCoefs).map(([name, coef]) => ({ name, coef }));
}

function createArcSpanConstraints(arcs: { source: string; target: string; reversed: boolean }[], glpk: GLPK) {
    const edgeConstraints = [];
    for (const arc of arcs) {
        // Change coefficient if the arc is reversed.
        edgeConstraints.push({
            name: `edgespan_constraint_${arc.source}_${arc.target}`,
            vars: [
                { name: arc.target, coef: 1 },
                { name: arc.source, coef: -1 }
            ],
            // Set to minimize (GLP_LO), the lower bound to 1 (lb), and the upper bound to infinity (ub).
            bnds: { type: glpk.GLP_LO, lb: 1, ub: Infinity }
        });
    }
    return edgeConstraints;
}

function createPositiveLayerConstraints(vertices: string[], glpk: GLPK) {
    const positiveConstraints = [];
    for (const v of vertices) {
        positiveConstraints.push({
            name: `positive_layer_constraint_${v}`,
            vars: [{ name: v, coef: 1 }],
            bnds: { type: glpk.GLP_LO, lb: 0, ub: Infinity }
        });
    }
    return positiveConstraints;
}

async function assignLayers(ocpn: ObjectCentricPetriNet) {
    const glpk = await getGLPKInstance();

    const ocpnGraph = new OCPNGraph(ocpn);
    // Initialize the OCPN graph, the ILP objective and constraints.
    const objectiveVars = createILPObjective(ocpnGraph.arcs);
    const arcConstraint = createArcSpanConstraints(ocpnGraph.arcs, glpk);
    const positiveConstraint = createPositiveLayerConstraints(ocpnGraph.nodes, glpk);

    // Define the linear program.
    const lp = {
        name: ocpn.name,
        objective: {
            direction: glpk.GLP_MIN,
            name: 'Minimize total arc span',
            vars: objectiveVars
        },
        subjectTo: [
            ...arcConstraint,
            ...positiveConstraint
        ],
        integers: ocpnGraph.nodes
    };
    // Solve the linear program.
    const result = await glpk.solve(lp);

    // Check for both optimal and feasible solutions.
    if (result.result.status !== glpk.GLP_OPT && result.result.status !== glpk.GLP_FEAS) {
        return null;
    }

    // Get the layers of the nodes.
    const layers = result.result.vars;
    const layering: { [key: number]: string[] } = {};
    // Iterate over the pairs of node and the node's layer.
    for (const [node, layer] of Object.entries(layers)) {
        if (layering[layer] === undefined) {
            layering[layer] = [];
        }
        // Add the node to the layer.
        layering[layer].push(node);
        // Find the corresponding node in the OCPN.
        if (ocpn.layout) {
            ocpn.layout.vertices[node].layer = layer;
        }
    }
    // Convert the layering object to an array of arrays.
    var layeringArray = [];
    for (const layer of Object.keys(layering)) {
        layeringArray.push(layering[Number(layer)]);
    }
    // Assign the layering to the OCPN layout.
    if (ocpn.layout) {
        ocpn.layout.layering = layeringArray;
    }
    return layering;
}

export default assignLayers;