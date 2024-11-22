const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');
const OCPNGraph = require('../classes/OCPNGraph');
const glpkModule = require('glpk.js');

/**
 * Creates the objective function for the ILP formulation of the layer assignment problem.
 *
 * @param {*} ocpn The OCPN.
 */
function createILPObjective(ocpn) {
    const vars = [];
    for (const arc of ocpn.arcs) {
        // Change coefficient if the arc is reversed.
        let dir = ocpn.layout.arcs[arc.id].reversed ? -1 : 1;
        vars.push({ name: arc.target.id, coef: 1 * dir });
        vars.push({ name: arc.source.id, coef: -1 * dir });
    }
    return combineCoefs(vars);
}

/**
 * Combines the coefficients of the ILP formulation variables. 
 *
 * @param {*} vars The ILP formulation variables.
 * @returns The ILP formulation variables with combined coefficients.
 */
function combineCoefs(vars) {
    const combCoefs = {};
    for (const { name, coef } of vars) {
        if (combCoefs[name] !== undefined) {
            combCoefs[name] += coef;
        } else {
            combCoefs[name] = coef;
        }
    }
    return Object.entries(combCoefs).map(([name, coef]) => ({ name, coef }));
}

/**
 * Creates the constraint: layer(target) - layer(source) >= 1 for all (source,target) in E.
 *
 * @param {*} ocpn The OCPN.
 * @param {*} glpk The glpk instance.
 * @returns The arc span constraints.
 */
function createArcSpanConstraints(ocpn, glpk) {
    const edgeConstraints = [];
    for (const arc of ocpn.arcs) {
        // Change coefficient if the arc is reversed.
        let dir = ocpn.layout.arcs[arc.id].reversed ? -1 : 1;
        edgeConstraints.push({
            name: `edgespan_constraint_${arc.source.name}_${arc.target.name}`,
            vars: [
                { name: arc.target.id, coef: 1 * dir },
                { name: arc.source.id, coef: -1 * dir }
            ],
            // Set to minimize (GLP_LO), the lower bound to 1 (lb), and the upper bound to infinity (ub).
            bnds: { type: glpk.GLP_LO, lb: 1, ub: Infinity }
        });
    }
    return edgeConstraints;
}

/**
 * Creates the constraint layer(u) >= 0 for all nodes of the OCPN.
 *
 * @param {*} ocpnGraph The graph of the OCPN to assign layers to.
 * @param {*} glpk The glpk instance.
 * @returns The positive layer constraints.
 */
function createPositiveLayerConstraints(ocpnGraph, glpk) {
    const positiveConstraints = [];
    for (const node of ocpnGraph.nodes) {
        positiveConstraints.push({
            name: `positive_layer_constraint_${node}`,
            vars: [{ name: node, coef: 1 }],
            bnds: { type: glpk.GLP_LO, lb: 0, ub: Infinity }
        });
    }
    return positiveConstraints;
}

/**
 * Solves the layer assignment problem for the given OCPN.
 * The returned solution is not necessarily a "proper" layering.
 * Thus, we add dummy vertices in a subsequent step to ensure that.
 *
 * @param {ObjectCentricPetriNet} ocpn 
 * @returns A layering of the nodes of the OCPN.
 */
async function assignLayers(ocpn) {
    const glpk = await glpkModule();

    // Initialize the OCPN graph, the ILP objective and constraints.
    const ocpnGraph = new OCPNGraph(ocpn);
    const objectiveVars = createILPObjective(ocpn);
    const arcConstraint = createArcSpanConstraints(ocpn, glpk);
    const positiveConstraint = createPositiveLayerConstraints(ocpnGraph, glpk);
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

    // console.log(result);
    // Check for both optimal and feasible solutions.
    if (result.result.status !== glpk.GLP_OPT && result.result.status !== glpk.GLP_FEAS) {
        return null; // TODO: switch to other layer assignment algorithm.
    }

    // Get the layers of the nodes.
    const layers = result.result.vars;
    const layering = {};
    // Iterate over the pairs of node and the node's layer.
    for (const [node, layer] of Object.entries(layers)) {
        if (layering[layer] === undefined) {
            layering[layer] = [];
        }
        // Add the node to the layer.
        layering[layer].push(node);
        // Find the corresponding node in the OCPN.
        ocpn.layout.vertices[node].layer = layer;
    }
    // Convert the layering object to an array of arrays.
    var layeringArray = [];
    for (const layer of Object.keys(layering)) {
        layeringArray.push(layering[layer]);
    }
    // Assign the layering to the OCPN layout.
    ocpn.layout.layering = layeringArray;
    return layering;
}

module.exports = assignLayers;