import React, { useState, useEffect, useRef } from 'react';
import VertexInfo from './VertexInfo';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import OCPNLayout from '../utils/classes/OCPNLayout';
import { select } from 'd3-selection';
import { zoom as d3Zoom, ZoomBehavior } from 'd3-zoom';

import './VisualizationArea.css';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    darkMode: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
    minScaleValue: number;
    maxScaleValue: number;
    setCurrentHover: (hover: string) => void;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, darkMode, svgRef, minScaleValue, maxScaleValue, setCurrentHover }) => {
    const [vertexInfo, setVertexInfo] = useState<{
        visible: boolean, x: number, y: number, vertexId: string, vertexName: string, vertexType: string, objectType: string | null, isSource: boolean, isSink: boolean
    }>({ visible: false, x: 0, y: 0, vertexId: '', vertexName: '', vertexType: 'transition', objectType: null, isSource: false, isSink: false });

    const vertexInfoRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRightClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
        if (!selectedOCPN?.layout) return;

        event.preventDefault();
        const target = event.target as HTMLElement;
        const elementId = target.id;
        console.log("Right click on element: ", elementId);
        const vertex = selectedOCPN.layout.vertices[elementId];
        if (vertex && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let x = event.clientX - containerRect.left;
            let y = event.clientY - containerRect.top;

            setVertexInfo({
                visible: true,
                x,
                y,
                vertexId: elementId,
                vertexName: vertex.type === OCPNLayout.PLACE_TYPE ? (vertex.name ?? '') : (vertex.label ?? ''),
                objectType: vertex.type === OCPNLayout.PLACE_TYPE ? (vertex.objectType ?? null) : null,
                vertexType: vertex.type === OCPNLayout.PLACE_TYPE ? 'place' : 'transition',
                isSource: userConfig.sources.includes(elementId),
                isSink: userConfig.sinks.includes(elementId),
            });
            return;
        }
    };

    useEffect(() => {
        if (vertexInfo.visible && vertexInfoRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const vertexInfoRect = vertexInfoRef.current.getBoundingClientRect();
            let { x, y } = vertexInfo;

            if (x + vertexInfoRect.width > containerRect.width) {
                x = containerRect.width - vertexInfoRect.width;
            }
            if (y + vertexInfoRect.height > containerRect.height) {
                y = containerRect.height - vertexInfoRect.height;
            }
            if (x < 0) {
                x = 0;
            }
            if (y < 0) {
                y = 0;
            }

            setVertexInfo(prev => ({ ...prev, x, y }));
        }
    }, [vertexInfo.visible]);


    const handleClickOutside = (event: MouseEvent) => {
        if (vertexInfoRef.current && !vertexInfoRef.current.contains(event.target as Node)) {
            setVertexInfo(prev => ({ ...prev, visible: false }));
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (selectedOCPN?.layout && svgRef.current) {
            const svg = select(svgRef.current);

            svg.selectAll('.ocpntransition, .ocpnplace, .ocpnarc')
                .on('contextmenu', handleRightClick)
                .on('mouseover', (event) => {
                    const target = event.target as HTMLElement;
                    const elementId = target.id;
                    // Differentiate between places, transitions, and arcs.
                    const vertex = selectedOCPN.layout?.vertices[elementId];
                    if (vertex) {
                        // Place or transition.
                        if (vertex.type === OCPNLayout.PLACE_TYPE) {
                            setCurrentHover(`${vertex.objectType}`);
                        } else {
                            const label = vertex.silent ? '𝜏' : `${vertex.label}`;
                            setCurrentHover(label);
                        }
                    } else {
                        // Arc.
                        const arc = selectedOCPN.layout?.arcs[elementId];
                        if (arc) {
                            setCurrentHover(`${arc.objectType}`);
                        }
                    }
                })
                .on('mouseout', () => {
                    setCurrentHover('');
                });

            const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3Zoom<SVGSVGElement, unknown>()
                // .scaleExtent([minScaleValue, maxScaleValue]) // User study concluded that the zoom restriction was unnecessary.
                .on('zoom', (event) => {
                    const g = svg.select('g');
                    g.attr('transform', event.transform);
                    // Hide labels when not readable anymore.
                    const zoomLevel = event.transform.k;
                    svg.selectAll('.ocpntransition.label')
                        .style('display', zoomLevel < userConfig.zoomVisibilityThreshhold ? 'none' : 'block');
                });

            svg.call(zoomBehavior);
        }
    }, [svgRef, selectedOCPN, minScaleValue, maxScaleValue]);

    const toggleSource = (vertexId: string) => {
        let modifySink = false;
        if (userConfig.sources.includes(vertexId)) {
            userConfig.sources = userConfig.sources.filter((source) => source !== vertexId);
        } else {
            userConfig.sources.push(vertexId);
            // A vertex cannot be both a source and a sink.
            userConfig.sinks = userConfig.sinks.filter((sink) => sink !== vertexId);
            modifySink = true;
        }
        setVertexInfo(prev => ({ ...prev, isSource: !prev.isSource, isSink: modifySink ? false : prev.isSink }));
    };

    const toggleSink = (vertexId: string) => {
        let modifySource = false;
        if (userConfig.sinks.includes(vertexId)) {
            userConfig.sinks = userConfig.sinks.filter((sink) => sink !== vertexId);
        } else {
            userConfig.sinks.push(vertexId);
            // A vertex cannot be both a source and a sink.
            userConfig.sources = userConfig.sources.filter((source) => source !== vertexId);
            modifySource = true;
        }
        setVertexInfo(prev => ({ ...prev, isSink: !prev.isSink, isSource: modifySource ? false : prev.isSource }));
    };

    return (
        <div className={`outer-visualization-container${darkMode ? ' dark' : ' light'}`}>
            <div
                ref={containerRef}
                className={`inner-visualization-container${darkMode ? ' dark' : ' light'}`}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    onContextMenu={handleRightClick}
                    style={{ backgroundColor: userConfig.svgBackgroundColor }}
                ></svg>
                {vertexInfo.visible && (
                    <div ref={vertexInfoRef} style={{ position: 'absolute', left: vertexInfo.x, top: vertexInfo.y }}>
                        <VertexInfo
                            vertexId={vertexInfo.vertexId}
                            vertexName={vertexInfo.vertexName}
                            vertexType={vertexInfo.vertexType}
                            objectType={vertexInfo.objectType}
                            darkMode={darkMode}
                            isSource={vertexInfo.isSource}
                            isSink={vertexInfo.isSink}
                            toggleSource={toggleSource}
                            toggleSink={toggleSink}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualizationArea;