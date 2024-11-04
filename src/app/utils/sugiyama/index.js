const fs = require('fs');
const path = require('path');
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

// Path to the JSON file
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';
const pnmlFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\pnml\\ocpa_p2p-normal.pnml';
var jsonOCPN = null;
var pnmlOCPN = null;
// Read the JSON file
const readJsonFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
      if (err) {
        reject('Error reading the JSON file: ' + err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

(async () => {
  try {
    const jsonObject = await readJsonFile();
    jsonOCPN = ObjectCentricPetriNet.fromJSON(jsonObject);
    console.log(jsonOCPN.toString());

    pnmlOCPN = await ObjectCentricPetriNet.fromPNML(pnmlFilePath);
    console.log(pnmlOCPN.toString());
    console.log(pnmlOCPN.equals(jsonOCPN));
  } catch (err) {
    console.error(err);
  }
})();
