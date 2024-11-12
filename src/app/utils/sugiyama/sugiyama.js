const fs = require('fs');
const reverseCycles = require('./cycleBreaking');
const assignLayers = require('./layerAssignment');
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

// Define the path to the JSON file
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\cyclic-ocpn.json'; 
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\simple_ocpn.json'; 

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    // Parse the JSON data
    const json = JSON.parse(data);

    // Create an ObjectCentricPetriNet instance from the JSON data
    const ocpn = ObjectCentricPetriNet.fromJSON(json);

    // Define sources and sinks (for demonstration purposes, you can modify these as needed)
    const sources = Array.from(ocpn.places).filter(place => place.initial).map(place => place.name);
    const sinks = Array.from(ocpn.places).filter(place => place.final).map(place => place.name);

    // Reverse the minimal set of arcs whose reversal makes the ocpn graph acyclic.
    reverseCycles(ocpn, sources, sinks);
    // Assign layers to the nodes of the graph such that no edge points towards a node in a lower layer.
    var layering = await assignLayers(ocpn);
    console.log(layering);
    // Log the result
    // console.log(ocpn.toString());
});