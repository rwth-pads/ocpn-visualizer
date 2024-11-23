const fs = require('fs');
const reverseCycles = require('./cycleBreaking');
const assignLayers = require('./layerAssignment');
const insertDummyVertices = require('./dummyVertexInsertion');
const orderVertices = require('./vertexOrdering');
const positionVertices = require('./vertexPositioning');
const routeArcs = require('./routeArcs');
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');
const OCPNLayout = require('../classes/OCPNLayout');


// Define the path to the JSON file.
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\cyclic-ocpn.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\simple_ocpn.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\double_edge_ocpn.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\type1-conflict-ocpn.json';

// Read the JSON file.
fs.readFile(jsonFilePath, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }
    // Parse the JSON data.
    const json = JSON.parse(data);
    // Create an ObjectCentricPetriNet instance from the JSON data.
    const ocpn = ObjectCentricPetriNet.fromJSON(json);
    // Apply the Sugiyama layout algorithm.
    const result = await sugiyama(ocpn, {});
});


async function sugiyama(ocpn, config) {
    // Init the OCPN Layout.
    ocpn.layout = new OCPNLayout(ocpn, config);
    // Cycle Breaking.
    console.log("Reversing cycles...");
    reverseCycles(ocpn, config);
    // Layer Assignment.
    console.log("Assigning layers...");
    await assignLayers(ocpn);
    // Dummy Vertex Insertion.
    console.log("Inserting dummy vertices...");
    insertDummyVertices(ocpn);
    // Vertex Ordering.
    console.log("Ordering vertices...");
    orderVertices(ocpn, config);
    // Vertex Positioning.
    console.log("Positioning vertices...");
    positionVertices(ocpn, config);
    // Route edges.
    console.log("Routing arcs...");
    routeArcs(ocpn);
    return ocpn.layout;
}

