This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
<!-- 
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->

## OCPN Input Format

The OCPN (Object-Centric Petri Net) input format is a JSON structure that defines the places, transitions, and arcs of the Petri net.
We adapted the format from the OCPA (Object-Centric Process Analysis) format to represent the OCPN.

See [OCPA](https://github.com/ocpm/ocpa)

Below is the format for each component:

### OCPN

The root object of the JSON file representing the OCPN should have the following structure:

```json
{
    "name": "OCPA P2P Normal OCPN Example",
    "properties": {
        "description": "This example is taken from the OCPA Github Repository.",
        "url": "https://github.com/ocpm/ocpa/blob/main/docs/source/_static/petri_net.png"
    },
    "places": [...],
    "transitions": [...],
    "arcs": [...]
}
```
Where:
- **name**: The name of the Petri net.
- **properties**: Additional properties of the Petri net, such as description and URL.
- **places**: An array of place objects.
- **transitions**: An array of transition objects.
- **arcs**: An array of arc objects.

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
    "properties": {
        "description": "This transition represents the action of placing an order.",
        "placeholder": "Properties accept any key-value pair."
    },
    "silent": false
}
```
Where:
- **name**: A unique identifier for the transition.
- **label**: The label displayed on the transition.
- **properties**: Additional properties of the transition, e.g., description
- **silent**: A boolean value indicating whether the transition is silent.

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