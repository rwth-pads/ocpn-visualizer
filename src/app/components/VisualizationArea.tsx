import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import VertexInfo from './VertexInfo';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import OCPNLayout from '../utils/classes/OCPNLayout';
import * as d3 from 'd3';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    setChange: (change: boolean) => void;
    darkMode: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
    minScaleValue: number;
    maxScaleValue: number;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, setChange, darkMode, svgRef, minScaleValue, maxScaleValue }) => {
    const [vertexInfo, setVertexInfo] = useState<{
        visible: boolean, x: number, y: number, vertexId: string, vertexName: string, vertexType: string, objectType: string | null, isSource: boolean, isSink: boolean
    }>({ visible: false, x: 0, y: 0, vertexId: '', vertexName: '', vertexType: 'transition', objectType: null, isSource: false, isSink: false });

    const vertexInfoRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRightClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        const elementId = target.id;
        console.log("Right click on element: ", elementId);
        const vertex = selectedOCPN?.layout.vertices[elementId];
        if (vertex && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let x = event.clientX - containerRect.left;
            let y = event.clientY - containerRect.top;

            setVertexInfo({
                visible: true,
                x,
                y,
                vertexId: elementId,
                vertexName: vertex.type === OCPNLayout.PLACE_TYPE ? vertex.name : vertex.label,
                objectType: vertex.type === OCPNLayout.PLACE_TYPE ? vertex.objectType : null,
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
        if (svgRef.current && selectedOCPN) {
            const svg = d3.select(svgRef.current);

            svg.selectAll('.ocpntransition, .ocpnplace, .ocpnarc')
                .on('contextmenu', handleRightClick);

            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([minScaleValue, maxScaleValue])
                .on('zoom', (event) => {
                    const g = svg.select('g');
                    g.attr('transform', event.transform);
                    // Hide labels when not readable anymore.
                    const zoomLevel = event.transform.k;
                    svg.selectAll('.ocpntransition.label').style('display', zoomLevel < userConfig.zoomVisibilityThreshhold ? 'none' : 'block');

                    // console.log("Zoom event: ", event.transform);
                    // console.log("Client Width: ", svgRef.current?.clientWidth);
                    // console.log("Client Height: ", svgRef.current?.clientHeight);
                    // console.log("G bbox: ",);
                    // const bbox = g.node()?.getBBox();
                    // const totalWidth = bbox ? bbox.width * event.transform.k : 0;
                    // const totalHeight = bbox ? bbox.height * event.transform.k : 0;
                    // console.log(`G size: ${totalWidth}, ${totalHeight}`);
                });

            svg.call(zoom);
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
        setChange(true);
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
        setChange(true);
    };

    return (
        <Box
            sx={{
                height: '90vh',
                width: '100vw',
                bgcolor: darkMode ? '#2b2a2a' : '#ffffff',
                overflow: 'hidden',
                userSelect: 'none',
            }}>
            <Box
                ref={containerRef}
                sx={{
                    height: '88vh',
                    width: '98vw',
                    margin: '1vh 1vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative', // Ensure the parent container is positioned
                    boxShadow: darkMode ? '0 0 10px 2.5px rgba(255, 255, 255, 0.5)' : '0 0 10px 5px rgba(0, 0, 0, 0.5)',
                }}
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
                            userConfig={userConfig}
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
            </Box>
        </Box>
    );
};

export default VisualizationArea;