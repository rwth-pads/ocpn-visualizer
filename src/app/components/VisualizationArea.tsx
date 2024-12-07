import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import VertexInfo from './VertexInfo';
import ArcInfo from './ArcInfo';
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
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, setChange, darkMode, svgRef }) => {
    const [vertexInfo, setVertexInfo] = useState<{
        visible: boolean, x: number, y: number, vertexId: string, vertexName: string, vertexType: string, objectType: string | null, isSource: boolean, isSink: boolean
    }>({ visible: false, x: 0, y: 0, vertexId: '', vertexName: '', vertexType: 'transition', objectType: null, isSource: false, isSink: false });

    const [arcInfo, setArcInfo] = useState<{
        visible: boolean, x: number, y: number, arcId: string, source: string, target: string, reversed: boolean, weight: number, path: string[], minLayer: number, maxLayer: number, type1: boolean, objectType: string
    }>({ visible: false, x: 0, y: 0, arcId: '', source: '', target: '', reversed: false, weight: 0, path: [], minLayer: 0, maxLayer: 0, type1: false, objectType: '' });

    const vertexInfoRef = useRef<HTMLDivElement>(null);
    const arcInfoRef = useRef<HTMLDivElement>(null);
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
            setArcInfo({ visible: false, x: 0, y: 0, arcId: '', source: '', target: '', reversed: false, weight: 0, path: [], minLayer: 0, maxLayer: 0, type1: false, objectType: '' });
            return;
        }
        const arc = selectedOCPN?.layout.arcs[elementId];
        if (arc && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let x = event.clientX - containerRect.left;
            let y = event.clientY - containerRect.top;

            setArcInfo({
                visible: true,
                x,
                y,
                arcId: elementId,
                source: arc.source,
                target: arc.target,
                reversed: arc.reversed,
                weight: arc.weight,
                path: arc.path,
                minLayer: arc.minLayer,
                maxLayer: arc.maxLayer,
                type1: arc.type1,
                objectType: arc.objectType,
            });
            setVertexInfo({ visible: false, x: 0, y: 0, vertexId: '', vertexName: '', vertexType: 'transition', objectType: null, isSource: false, isSink: false });
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

    useEffect(() => {
        if (arcInfo.visible && arcInfoRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const arcInfoRect = arcInfoRef.current.getBoundingClientRect();
            let { x, y } = arcInfo;

            if (x + arcInfoRect.width > containerRect.width) {
                x = containerRect.width - arcInfoRect.width;
            }
            if (y + arcInfoRect.height > containerRect.height) {
                y = containerRect.height - arcInfoRect.height;
            }
            if (x < 0) {
                x = 0;
            }
            if (y < 0) {
                y = 0;
            }

            setArcInfo(prev => ({ ...prev, x, y }));
        }
    }, [arcInfo.visible]);

    const handleClickOutside = (event: MouseEvent) => {
        if (vertexInfoRef.current && !vertexInfoRef.current.contains(event.target as Node)) {
            setVertexInfo(prev => ({ ...prev, visible: false }));
        }
        if (arcInfoRef.current && !arcInfoRef.current.contains(event.target as Node)) {
            setArcInfo(prev => ({ ...prev, visible: false }));
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('.ocpntransition, .ocpnplace, .ocpnarc')
                .on('contextmenu', handleRightClick);

            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.1, 10])
                .on('zoom', (event) => {
                    svg.selectAll('g').attr('transform', event.transform);
                });

            svg.call(zoom);
        }
    }, [svgRef, selectedOCPN]);

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
                    border: darkMode ? '1px solid #f2f2f2' : '1px solid black',
                    height: '88vh',
                    width: '98vw',
                    margin: '1vh 1vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative', // Ensure the parent container is positioned
                }}
            >
                <svg ref={svgRef} width="100%" height="100%" onContextMenu={handleRightClick}></svg>
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
                {arcInfo.visible && (
                    <div ref={arcInfoRef} style={{ position: 'absolute', left: arcInfo.x, top: arcInfo.y }}>
                        <ArcInfo
                            darkMode={darkMode}
                            arcId={arcInfo.arcId}
                            source={arcInfo.source}
                            target={arcInfo.target}
                            reversed={arcInfo.reversed}
                            weight={arcInfo.weight}
                            path={arcInfo.path}
                            minLayer={arcInfo.minLayer}
                            maxLayer={arcInfo.maxLayer}
                            type1={arcInfo.type1}
                            objectType={arcInfo.objectType}
                        />
                    </div>
                )}
            </Box>
        </Box>
    );
};

export default VisualizationArea;