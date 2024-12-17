
class OCPNConfig {

    constructor(
        includedObjectTypes = [],
        sources = [],
        sinks = [],
        indicateSourcesSinks = false,
        objectCentrality = undefined,
        maxBarycenterIterations = 6,
        objectAttraction = 0.1,
        objectAttractionRangeMin = 1,
        objectAttractionRangeMax = 2,
        direction = "TB",
        placeRadius = 2.5,
        customTransitionWidth = false,
        transitionWidth = 30,
        silentTransitionWidth = 10,
        transitionHeight = 5,
        dummySize = 2,
        layerSep = 20,
        vertexSep = 5, // For now bigger than any other size declaration to avoid overlapping. TODO
        borderPaddingX = 30,
        borderPaddingY = 10,
        typeColorMapping = new Map(),
        defaultPlaceColor = "#000000",
        transitionColor = "#000000",
        transitionFillColor = "#ffffff",
        transitionBorderSize = 0.3,
        svgBackgroundColor = "#ffffff",
        combineArcs = false,
        arcSize = 0.8,
        indicateArcWeight = false,
        arrowHeadSize = 3,
        arcDefaultColor = "#000000",
        seeAlignmentType = false,
        zoomVisibilityThreshhold = 3,
        alignmentType = "downLeft" // downLeft, downRight, upLeft, upRight
    ) {
        this.includedObjectTypes = includedObjectTypes;
        // Cycle Breaking
        this.sources = sources; // The ids of user selected sources.
        this.sinks = sinks; // The ids of user selected sinks.
        this.indicateSourcesSinks = indicateSourcesSinks;
        // Vertex Ordering
        this.objectCentrality = objectCentrality; // Let the user define an initial ordering of the vertices in the layers.
        this.maxBarycenterIterations = maxBarycenterIterations;
        this.objectAttraction = objectAttraction; // [0, 1]
        this.objectAttractionRangeMin = objectAttractionRangeMin; // [1, layer.length]
        this.objectAttractionRangeMax = objectAttractionRangeMax; // [min, layer.length]
        // Vertex Positioning
        this.direction = direction; // TODO: add LR
        this.placeRadius = placeRadius;
        this.transitionCustomWidth = customTransitionWidth;
        this.transitionWidth = transitionWidth;
        this.silentTransitionWidth = silentTransitionWidth;
        this.transitionHeight = transitionHeight;
        this.dummySize = dummySize;
        this.layerSep = layerSep; // The space between the bounds of two adjacent layers.
        this.vertexSep = vertexSep; // The space between two adjacent vertices on the same layer.
        this.borderPaddingX = borderPaddingX; // The padding of the layout from the x-axis.
        this.borderPaddingY = borderPaddingY; // The padding of the layout from the y-axis.
        // Styling
        this.typeColorMapping = typeColorMapping;
        this.defaultPlaceColor = defaultPlaceColor;
        this.transitionColor = transitionColor;
        this.transitionFillColor = transitionFillColor;
        this.transitionBorderSize = transitionBorderSize;
        this.svgBackgroundColor = svgBackgroundColor;
        this.combineArcs = combineArcs;
        this.arcSize = arcSize;
        this.indicateArcWeight = indicateArcWeight;
        this.arrowHeadSize = arrowHeadSize;
        this.arcDefaultColor = arcDefaultColor;
        this.zoomVisibilityThreshhold = zoomVisibilityThreshhold;
        this.seeAlignmentType = seeAlignmentType;
        this.alignmentType = alignmentType;
    }
}

export default OCPNConfig;