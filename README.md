### OCPN Visualizer
The OCPN Visualizer is a web-application designed to visualize Object-Centric Petri Nets (OCPNs). It provides an interactive interface to display the structure of the OCPN and the current marking of the Petri net. The OCPN Visualizer is built using React and D3.js. It is publicly available at 

[`OCPN Visualizer`](https://codenametobi.github.io/ocpn-visualizer/)

In the following sections, we provide an overview of the OCPN input format.

## OCPN Input Format (JSON)
The OCPN (Object-Centric Petri Net) input format is a JSON structure that defines the places, transitions, and arcs of the Petri net.
We adapted the format from the OCPA (Object-Centric Process Analysis) format to represent the OCPN.

See [OCPA](https://github.com/ocpm/ocpa)

Below is the format for each component:

### OCPN

The root object of the JSON file representing the OCPN should have the following structure:

```json
{
    "name": "OCPA P2P Normal OCPN Example",
    "places": [...],
    "transitions": [...],
    "arcs": [...],
    "properties": {
        "description": "This example is taken from the OCPA Github Repository."
    }
}
```
Where:
- **name**: The name of the Petri net.
- **places**: An array of place objects.
- **transitions**: An array of transition objects.
- **arcs**: An array of arc objects.
- **properties**: Additional properties of the Petri net, such as description.

### Place
Each place object should have the following structure:
```json
{
    "name": "order1",
    "objectType": "order",
    "initial": true,
    "final": false
}
```
Where:
- **name**: A unique identifier for the place.
- **objectType**: The type of object that the place represents.
- **initial**: A boolean value indicating whether the place is a source place.
- **final**: A boolean value indicating whether the place is a sink place.

### Transition
Each transition object should have the following structure:
```json
{
    "name": "t1",
    "label": "Place Order",
    "silent": false,
    "properties": {
        "description": "This transition represents the action of placing an order.",
        "placeholder": "Properties accept any key-value pair."
    }
}
```
Where:
- **name**: A unique identifier for the transition.
- **label**: The label displayed on the transition.
- **silent**: A boolean value indicating whether the transition is silent.
- **properties**: Additional properties of the transition, e.g., description.

### Arc
Each arc object should have the following structure:
```json
{
    "source": "order1",
    "target": "t1",
    "weight": 1,
    "variable": false,
    "properties": {}
}
```
Where:
- **source**: The name of the source place or transition.
- **target**: The name of the target place or transition.
- **weight**: The weight of the arc.
- **variable**: A boolean value indicating whether the arc is a variable arc. Variable arcs can consume multiple tokens.
- **properties**: Additional properties of the arc.

By following this format, you can create a JSON file that represents an Object-Centric Petri Net and is used as the input for the **OCPN Visualizer**.

### Example
An exemplary OCPN input file is provided in the [`public/sample_ocpns/json`](https://github.com/rwth-pads/ocpn-visualizer/blob/master/public/sample_ocpns/json/ocpa_p2p-normal.json) directory of this project. You can use this file as a template to create your own OCPN input files.


![Example Visualization of an OCPN](https://github.com/rwth-pads/ocpn-visualizer/blob/algorithm/public/images/example_visualization.png)


## License
This project was developed as part of a bachelor's thesis at RWTH Aachen University within the PADS group.