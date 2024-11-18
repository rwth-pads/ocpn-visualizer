const fs = require('fs');
// import reverseCycles from './cycleBreaking';
const reverseCycles = require('./cycleBreaking');
// import assignLayers from './layerAssignment';
const assignLayers = require('./layerAssignment');
// import insertDummyVertices from './dummyVertexInsertion';
const insertDummyVertices = require('./dummyVertexInsertion');
// import orderVertices from './vertexOrdering';
const orderVertices = require('./vertexOrdering');
// import positionVertices from './vertexPositioning';
const positionVertices = require('./vertexPositioning');
// import ObjectCentricPetriNet from '../classes/ObjectCentricPetriNet';
const ObjectCentricPetriNet = require('../classes/ObjectCentricPetriNet');

// Define the path to the JSON file.
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\ocpa_p2p-normal.json';
const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\cyclic-ocpn.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\simple_ocpn.json';
// const jsonFilePath = 'C:\\Users\\tobia\\Documents\\Studium\\RWTH_Informatik\\Semester\\7. WiSe 24_25\\BA\\code\\ocpn-visualizer\\public\\sample_ocpns\\json\\double_edge_ocpn.json';

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

    // Define sources and sinks (for demonstration purposes, later integrated into the application and algorithm).
    const sources = Array.from(ocpn.places).filter(place => place.initial).map(place => place.name);
    const sinks = Array.from(ocpn.places).filter(place => place.final).map(place => place.name);

    // Reverse the minimal set of arcs whose reversal makes the ocpn graph acyclic.
    var reversedArcsCount = reverseCycles(ocpn, sources, sinks);
    console.log("Arcs reversed: ", reversedArcsCount);

    // Layer Assignment.
    var layering = await assignLayers(ocpn);
    console.log("Layering: ", layering);

    // Dummy Vertex Insertion.
    var [dummyCount, layeringArray] = insertDummyVertices(ocpn, layering);
    // console.log("Dummy vertices inserted: ", dummyCount);
    console.log("Layering (with dummies): ", layeringArray);

    // Vertex Ordering.
    const config = { oa: 0}; // TODO: Add the actual configurations.
    var [layeringScore, layeringArray] = orderVertices(ocpn, layeringArray, config);
    // console.log("Layering score: ", layeringScore);
    console.log("Barycenter sweep applied: ", layeringArray);

    // Vertex Positioning.
    // const config = { ranksep: 1 }; // TODO: Add the actual configurations.
    // positionVertices(ocpn, layeringArray, config);
    // console.log("Resulting OCPN: ", ocpn.toString());
    // ocpn.places.forEach(place => {
    //     console.log(place.name);
    //     console.log(`\t${positionVertices.getUpperNeighbors(ocpn, place.name)}`);
    // });
    // ocpn.transitions.forEach(transition => {
    //     console.log(transition.name);
    //     console.log(`\t${positionVertices.getUpperNeighbors(ocpn, transition.name)}`);
    // });
    ocpn.dummyNodes.forEach(dummy => {
        console.log(dummy.name);
        console.log(`\t${positionVertices.getUpperNeighbors(ocpn, dummy.name)}`);
        console.log(`\t${positionVertices.isIncidentToInnerSegment(ocpn, dummy.name)}`)
    });
    // console.log(`OCPN Name: \t${ocpn.name}`);
});
