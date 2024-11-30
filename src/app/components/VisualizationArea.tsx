import React from 'react';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    darkMode: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, darkMode, svgRef }) => {
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
                sx={{
                    border: '2px solid black',
                    height: '88vh',
                    width: '98vw',
                    margin: '1vh 1vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <svg ref={svgRef} width="100%" height="100%"></svg>
            </Box>
        </Box>
    );
};

export default VisualizationArea;