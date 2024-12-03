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
    darkMode: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, darkMode, svgRef }) => {
    const [vertexInfo, setVertexInfo] = useState<{
        visible: boolean, x: number, y: number, vertexId: string, vertexName: string, vertexType: string, objectType: string | null, isSource: boolean, isSink: boolean
    }>({ visible: false, x: 0, y: 0, vertexId: '', vertexName: '', vertexType: 'transition', objectType: null, isSource: false, isSink: false });

    const vertexInfoRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRightClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        const vertexId = target.id;
        const vertex = selectedOCPN?.layout.vertices[vertexId];
        if (vertex && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let x = event.clientX - containerRect.left;
            let y = event.clientY - containerRect.top;

            setVertexInfo({
                visible: true,
                x,
                y,
                vertexId,
                vertexName: vertex.name,
                objectType: vertex.type === OCPNLayout.PLACE_TYPE ? vertex.objectType : null,
                vertexType: vertex.type === OCPNLayout.PLACE_TYPE ? 'place' : 'transition',
                isSource: vertex.source,
                isSink: vertex.sink
            });
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
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('.ocpntransition, .ocpnplace')
                .on('contextmenu', handleRightClick);
        }
    }, [svgRef, selectedOCPN]);

    return (
        <Box
            sx={{
                height: '90vh',
                width: '100vw',
                bgcolor: darkMode ? '#ffffff' : '#ffffff',
                overflow: 'hidden',
                userSelect: 'none',
            }}>
            <Box
                ref={containerRef}
                sx={{
                    border: '2px solid black',
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
                            vertexId={vertexInfo.vertexId}
                            vertexName={vertexInfo.vertexName}
                            darkMode={darkMode}
                            vertexType={vertexInfo.vertexType}
                            objectType={vertexInfo.objectType}
                            isSource={vertexInfo.isSource}
                            isSink={vertexInfo.isSink}
                        />
                    </div>
                )}
            </Box>
        </Box>
    );
};

export default VisualizationArea;