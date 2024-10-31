// ## Input
// - places: id, label
// - transitions: id, label
// - edges: sourceid, targetid, variableArc

// ## Data Structures
// - object attraction [0,1] float
// - object weight (1...10) Map { objecttype -> int }
// - object centrality (sequence) sorted array [car, item, ..., order]
// - place_size // Size of places in radius
// - transition_size // Size of transitions in width and height
// - dummy_size // Size of dummy vertices as square width
// - rank_sep // Distance between two layers
// - min_vertex_sep // Minimal distance between two vertices on the same layer
// - flow_dir // Layering direction (default: top-bottom) as integer
// (- ordering_type // default barycenter, maybe add median heuristic)

// Sugiyama Representation:
// - object_attraction         default = 0.1
// - object_weight             [{object_type: 1},...] default every type = 1
// - object_centrality         [object_type1, object_type2] default null
// - place_size                default =
// - transition_size           default = 
// - dummy_size                default = 
// - rank_sep                  default = 
// - min_vertex_sep            default =
// - flow_dir                  default top-bottom = 
// - ordering_type             default modified_barycenter = 
// - For each step we store the result so we can resume computation from substeps on change
// 1. acyclic          sequence of GR = [nodeid1, nodeidN]
// 2. layers           result of LA = [[nodeid1,nodeid2], [nodeid3],[nodeid4,...],...]
// 3. orders           result of VO = bary([[nodeid1,nodeid2], [nodeid3],[nodeid4,...],...])
// 4. coordinates      result of VP = [nodeid1:{x:_, y:_}, ...]

// Object Type
// - color
// - opacity
// - included

// Graph Representation:
// - node list     array
// - edge list     array

// Node
// - id, x, y, layer, order (for Vertex Ordering), minlayer::bool, maxlayer::bool

// Place (inherits from Node)
// - object type
// - label

// Transition (inherits from Node)
// - label

// Dummy (inherits from Node)
// - id
// - top       bool (if dummy is top dummy then we have to position its y coordinate at the top of the layer)
// - bottom    bool (if bottom then y coordinate at bottom of layer)

// Edge
// - source            nodeid
// - target            nodeid
// - multiple          bool (for variable arcs)
// - reversed          bool
// - path  	        array sorted by flow_dir [{x:_, y:_}]

// ## Preprocessing
// - input: file or json object to an ocpn
// 1. parse into OCPN Graph
// 2. Filter only on selected object types
// 3. Connected Components
// - output: connected ocpn graphs [graph1, graph2]

// ## Cycle Breaking
// - input cyclic graph
// 1. add user selected sources and sinks to front/end of sets.
// 2. apply Greedy Cycle Removal Algorithm
// - output acyclic graph with reversed edges

// ## Layer Assignment
// - input: acyclic graph
// - output: acyclic graph with layering [[nodeid1,nodeid2],[nodeid3,...],...]

// ## Vertex Ordering
// - input: layering
// - output: ordered (according to our heuristic) layering

// ## Vertex Positioning
// - input: layered acyclic graph
// - output: x/y coordinates for every node

// ## Edge Routing
// - input: x/y coordinates for every node (including dummy nodes)
// - output: paths for edges using ports.

// --- For the actual React implementation -------------
import { Graph } from './graph';
import { preprocess } from './preprocess';
import { breakCycles } from './cycleBreaking';
import { assignLayers } from './layerAssignment';
import { orderVertices } from './vertexOrdering';
import { positionVertices } from './vertexPositioning';
import { routeEdges } from './edgeRouting';
// -- For Debugging ------------------------------
// Graph = require('./graph');
// preprocess = require('./preprocess');
// breakCycles = require('./cycleBreaking');
// assignLayers = require('./layerAssignment');
// orderVertices = require('./vertexOrdering');
// positionVertices = require('./vertexPositioning');
// routeEdges = require('./edgeRouting');
// -----------------------------------------------

console.log("Sugiyama Layout Algorithm");

export {
  Graph,
  preprocess,
  breakCycles,
  assignLayers,
  orderVertices,
  positionVertices,
  routeEdges
};