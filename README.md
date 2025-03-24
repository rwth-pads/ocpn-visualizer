### OCPN Visualizer
The OCPN Visualizer is a web-application designed to visualize Object-Centric Petri Nets (OCPNs). It provides an interactive interface to display the structure of the OCPN.
The OCPN Visualizer is built using React and D3.js. It is publicly available at 

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

## How to transform PM4Py jsonocel to the OCPN Visualizer JSON format
You can use the following code snippet to transform a .jsonocel file to the OCPN Visualizer JSON format using the PM4Py library.

```python
import pm4py
import json

# Function to create the OCPN JSON structure from the PM4Py OCPN dictionary.
def create_ocpn_json(activities, petri_nets, name):
    ocpn_name = name
    places = []
    transitions = []
    arcs = []
    silent_transitions = []
    unique_place_id = 0
    # Create a transition for every activity.
    for activity in activities:
        transitions.append({
            "name": activity,
            "label": activity,
            "silent": False
        })
    for ot in petri_nets:
        # Get the Petri net details for this object type.
        net, im, fm = petri_nets[ot]
        # Create a mapping of the places to their unique names.
        place_mapping = {}
        # Create a place for every place in the Petri net.
        for place in net.places:
            unique_name = str(place) + "_" + str(unique_place_id)
            unique_place_id += 1
            places.append({
                "name": unique_name,
                "objectType": str(ot),
                "initial": str(place) == "source",
                "final": str(place) == "sink"
            })
            place_mapping[place] = unique_name
        # Create an arc for every arc in the Petri net.
        for arc in net.arcs:
            arc_type = "place_to_transition" if type(
                arc.source) is pm4py.objects.petri_net.obj.PetriNet.Place else "transition_to_place"
            if arc_type == "place_to_transition":
                # Get the source and target of the arc.
                source = place_mapping[arc.source]
                target = arc.target.label
                # Check whether the target is a silent transition.
                if arc.target.label == None:
                    # The target is a silent transition, check whether we have already added it.
                    silent_t = arc.target.name
                    # If not already in transitions, add it.
                    if silent_t not in silent_transitions:
                        silent_transitions.append(silent_t)
                        transitions.append({
                            "name": silent_t,
                            "label": silent_t,
                            "silent": True
                        })
                    target = silent_t
                # Add the arc to the list of arcs.
                arcs.append({
                    "source": source,
                    "target": target,
                    "weight": 1,
                    "variable": False,
                    "properties": {}
                })
            elif arc_type == "transition_to_place":
                # Get the source and target of the arc.
                source = arc.source.label
                target = place_mapping[arc.target]
                # Check whether the source is a silent transition.
                if arc.source.label == None:
                    # The target is a silent transition, check whether we have already added it.
                    silent_t = arc.source.name
                    # If not already in transitions, add it.
                    if silent_t not in silent_transitions:
                        silent_transitions.append(silent_t)
                        transitions.append({
                            "name": silent_t,
                            "label": silent_t,
                            "silent": True
                        })
                    source = silent_t           
                # Add the arc to the list of arcs.
                arcs.append({
                    "source": source,
                    "target": target,
                    "weight": 1,
                    "variable": False,
                    "properties": {}
                })
    # Return the final JSON structure.
    return {
        "name": ocpn_name,
        "places": places,
        "transitions": transitions,
        "arcs": arcs,
        "properties": {}
    }

# USER INPUT REQUIRED.
ocpn_name = "Enter the desired name here"
filePath = "Enter the path to the jsonocel file here"
fileOutPath = "Enter the path to the output JSON file here"
# Load the event log from the XML file
ocel = pm4py.read_ocel(filePath)
# Discover the Object-Centric Petri Net (OCPN) from the event log
ocpn = pm4py.discover_oc_petri_net(ocel)

# Generate the JSON structure.
ocpn_json = create_ocpn_json(
    ocpn['activities'], ocpn["petri_nets"], ocpn_name
)
# Save the OCPN to a JSON file in the format of the OCPN Visualizer.
with open(fileOutPath, "w") as f:
    json.dump(ocpn_json, f, indent=4)

```
Works with the following PM4Py version: pm4py-2.7.14.4

## How to transform OCPA to the OCPN Visualizer JSON format
The OCPN Visualizer JSON format is a subset of the OCPA JSON format. To transform an OCPA JSON file to the OCPN Visualizer JSON format, you can adapt the following code snippet:

```python
import json
import os

def place_to_json(place):
    """
    Convert a place object to a JSON object.
    """
    return {
        "name": place.name,
        "objectType": place.object_type,
        "initial": place.initial,
        "final": place.final
    }


def transition_to_json(transition):
    """
    Convert a transition object to a JSON object.
    """
    return {
        "name": transition.name,
        "label": transition.label,
        "properties": transition.properties,
        "silent": transition.silent
    }


def arc_to_json(arc):
    """
    Convert an arc object to a JSON object.
    """
    return {
        "source": arc.source.name,
        "target": arc.target.name,
        "weight": arc.weight,
        "variable": arc.variable,
        "properties": arc.properties
    }


def ocpn_to_json(ocpn, name, properties):
    if not name:
        name = "OCPN"

    if not properties:
        properties = {}

    places = [place_to_json(place) for place in ocpn.places]
    transitions = [transition_to_json(transition)
                   for transition in ocpn.transitions]
    arcs = [arc_to_json(arc) for arc in ocpn.arcs]

    return {
        "name": name,
        "places": places,
        "transitions": transitions,
        "arcs": arcs,
        "properties": properties
    }


def save_ocpn_to_json(ocpn, filename, ocpnname = '', properties = {}):
    """
    Save an OCPN object to a JSON file.
    """

    # Ensure the directory exists.
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    # Write the OCPN to the file.
    with open(filename, 'w') as f:
        json.dump(ocpn_to_json(ocpn, ocpnname, properties), f, indent=4)


# New file.
import os
from ocpa.objects.log.importer.ocel import factory as ocel_import_factory
from ocpa.algo.discovery.ocpn import algorithm as ocpn_discovery_factory
from ocpa_to_ocpn_visualizer import save_ocpn_to_json

# From folder containing the jsonocel files.
from_folder = "event_logs/"
to_folder = "ocpn_visualizer/"

# Ensure the output directory exists
os.makedirs(to_folder, exist_ok=True)

# Process each file in the from_folder
for file in os.listdir(from_folder):
    if file.endswith(".jsonocel"):
        print(f"Start processing {file}")
        filename = os.path.join(from_folder, file)
        save_to = os.path.join(to_folder, file.replace(".jsonocel", ".json"))

        ocel = ocel_import_factory.apply(file_path=filename)
        ocpn = ocpn_discovery_factory.apply(ocel, parameters={"debug": False})

        save_ocpn_to_json(ocpn, save_to, ocpnname=file.replace(
            ".jsonocel", ""), properties={"description": "Event log from ocpa repository."})
        print(f"Processed {file} and saved to {save_to}")
```
Requires ocpa-1.3.3 pm4py-2.2.32.

### Example
An exemplary OCPN input file is provided in the [`public/sample_ocpns/json`](https://github.com/rwth-pads/ocpn-visualizer/blob/master/public/sample_ocpns/json/ocpa_p2p-normal.json) directory of this project. You can use this file as a template to create your own OCPN input files.


![Example Visualization of an OCPN](https://github.com/rwth-pads/ocpn-visualizer/blob/algorithm/public/images/example_visualization.png)


## License
This project was developed as part of a bachelor's thesis at RWTH Aachen University within the PADS group.