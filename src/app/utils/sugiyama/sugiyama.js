const fs = require('fs');
const reverse_cycles = require('./cycleBreaking');
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

// Define the path to the JSON file
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\cyclic-ocpn.json'; 
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\simple_ocpn.json'; 

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
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

    // Perform the reverse_cycles algorithm on the OCPN
    reverse_cycles(ocpn, sources, sinks);

    // Log the result
    console.log(ocpn.toString());
});