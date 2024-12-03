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
        visible: boolean, x: number, y: number, vertexId: string, vertexName: string, vertexType: String, objectType: string | null, isSource: boolean, isSink: boolean
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
            setVertexInfo({
                visible: true,
                x: event.clientX - containerRect.left,
                y: event.clientY - containerRect.top,
                vertexId: vertexId,
                vertexName: vertex.name,
                objectType: vertex.type === OCPNLayout.PLACE_TYPE ? vertex.objectType : null,
                vertexType: vertex.type === OCPNLayout.PLACE_TYPE ? 'place' : 'transition',
                isSource: vertex.source,
                isSink: vertex.sink
            });
        }
    };

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
                            vertexType='place'
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