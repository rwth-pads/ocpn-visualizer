const fs = require('fs');
const reverseCycles = require('./cycleBreaking');
const assignLayers = require('./layerAssignment');
const insertDummyVertices = require('./dummyVertexInsertion');
const orderVertices = require('./vertexOrdering');
const positionVertices = require('./vertexPositioning');
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');


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
    const result = await sugiyama(ocpn);

});


async function sugiyama(ocpn) {
    console.log("Sugiyama input: ", ocpn);
    // Cycle Breaking.
    var reversedArcsCount = reverseCycles(ocpn, [], []);
    // Layer Assignment.
    var layering = await assignLayers(ocpn);
    // Dummy Vertex Insertion.
    var [dummyCount, layeringArray] = insertDummyVertices(ocpn, layering);
    console.log("Dummies ", layeringArray);
    // Vertex Ordering.
    var [layeringScore, layeringArray] = orderVertices(ocpn, layeringArray, { oa: 0 });
    console.log("Order ", layeringArray);
    // Vertex Positioning.
    positionVertices(ocpn, layeringArray, { ranksep: 1 });
    // TODO: transform dummy vertices to edge points and reverse reversed arcs back to normal direction.
    return ocpn;
}

