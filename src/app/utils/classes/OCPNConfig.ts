class OCPNConfig {
    includedObjectTypes: string[];
    sources: string[];
    sinks: string[];
    indicateSourcesSinks: boolean;
    objectCentrality: { [key: string]: number } | undefined;
    maxBarycenterIterations: number;
    objectAttraction: number;
    objectAttractionRangeMin: number;
    objectAttractionRangeMax: number;
    direction: string;
    placeRadius: number;
    transitionWidth: number;
    silentTransitionWidth: number;
    transitionHeight: number;
    dummySize: number;
    layerSep: number;
    vertexSep: number;
    borderPadding: number;
    typeColorMapping: Map<string, string>;
    defaultPlaceColor: string;
    transitionColor: string;
    transitionFillColor: string;
    transitionTextColor: string;
    transitionBorderSize: number;
    svgBackgroundColor: string;
    arcSize: number;
    indicateArcWeight: boolean;
    indicateVariableArcs: boolean;
    arcDefaultColor: string;
    seeAlignmentType: boolean;
    zoomVisibilityThreshhold: number;
    highlightOpacity: number;
    variableArcIndicatorColor: string;
    variableArcIndicatorSize: number;
    alignmentType: string;

    constructor(
        includedObjectTypes = [],
        sources = [],
        sinks = [],
        indicateSourcesSinks = false,
        objectCentrality = undefined,
        maxBarycenterIterations = 6,
        objectAttraction = 0.1,
        objectAttractionRangeMin = 1,
        objectAttractionRangeMax = 1,
        direction = "TB",
        placeRadius = 4,
        transitionWidth = 30,
        silentTransitionWidth = 10,
        transitionHeight = 5,
        dummySize = 2,
        layerSep = 15,
        vertexSep = 5,
        borderPadding = 10,
        typeColorMapping = new Map(),
        defaultPlaceColor = "#000000",
        transitionColor = "#000000",
        transitionFillColor = "#ffffff",
        transitionTextColor = "#000000",
        transitionBorderSize = 0.3,
        svgBackgroundColor = "#ffffff",
        arcSize = 1,
        indicateArcWeight = false,
        indicateVariableArcs = false,
        arcDefaultColor = "#000000",
        seeAlignmentType = false,
        zoomVisibilityThreshhold = 0,
        highlightOpacity = 0.2,
        variableArcIndicatorColor = '#ff0000',
        variableArcIndicatorSize = 3,
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
        this.direction = direction;
        this.placeRadius = placeRadius;
        this.transitionWidth = transitionWidth;
        this.silentTransitionWidth = silentTransitionWidth;
        this.transitionHeight = transitionHeight;
        this.dummySize = dummySize;
        this.layerSep = layerSep; // The space between the bounds of two adjacent layers.
        this.vertexSep = vertexSep; // The space between two adjacent vertices on the same layer.
        this.borderPadding = borderPadding; // The padding of the layout.
        // Styling
        this.typeColorMapping = typeColorMapping;
        this.defaultPlaceColor = defaultPlaceColor;
        this.transitionColor = transitionColor;
        this.transitionFillColor = transitionFillColor;
        this.transitionTextColor = transitionTextColor;
        this.transitionBorderSize = transitionBorderSize;
        this.svgBackgroundColor = svgBackgroundColor;
        this.arcSize = arcSize;
        this.indicateArcWeight = indicateArcWeight;
        this.indicateVariableArcs = indicateVariableArcs;
        this.arcDefaultColor = arcDefaultColor;
        this.zoomVisibilityThreshhold = zoomVisibilityThreshhold;
        this.highlightOpacity = highlightOpacity;
        this.variableArcIndicatorColor = variableArcIndicatorColor;
        this.variableArcIndicatorSize = variableArcIndicatorSize;
        this.seeAlignmentType = seeAlignmentType;
        this.alignmentType = alignmentType;
    }
}

export default OCPNConfig;