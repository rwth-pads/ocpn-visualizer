const fs = require('fs');
const path = require('path');
const ObjectCentricPetriNet = require('./ObjectCentricPetriNet');

// Path to the JSON file
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    // Parse the JSON data
    const jsonObject = JSON.parse(data);

    // Test the fromJSON function
    const petriNet = ObjectCentricPetriNet.fromJSON(jsonObject);

    // Log the result
    console.log(petriNet.toString());
});
