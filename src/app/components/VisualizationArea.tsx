import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNLayout from '../utils/classes/OCPNLayout';
import OCPNConfig from '../utils/classes/OCPNConfig';
import sugiyama from '../utils/sugiyama/sugiyama.js';
import { visualizeOCPN } from '../utils/lib/visualizationUtils';

const COLORS_ARRAY = ['#99cefd', '#f5a800', '#002e57', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'maroon', 'navy', 'olive', 'silver', 'aqua', 'fuchsia', 'gray', 'black'];

interface VisualizationAreaProps {
    selectedOCPN: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    darkMode: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
    previousOCPNRef: React.MutableRefObject<ObjectCentricPetriNet | null>;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ selectedOCPN, userConfig, darkMode, svgRef, previousOCPNRef }) => {

    useEffect(() => {
        const updateVisualization = async () => {
            // TODO: layout is recomputed for the same layout if window size changes so much that the visualization area is closed and reopened.
            if (selectedOCPN && selectedOCPN !== previousOCPNRef.current) {
                // Clear the existing SVG content
                d3.select(svgRef.current!).selectAll('*').remove();

                const ocpnLayout: OCPNLayout = await sugiyama(selectedOCPN, userConfig);

                if (!ocpnLayout) return;
                // Map the OCPN to a layout
                // console.log(ocpnLayout);
                visualizeOCPN(ocpnLayout, userConfig, svgRef.current!);
                previousOCPNRef.current = selectedOCPN;
            }
        }
        updateVisualization();
    }, [selectedOCPN, userConfig]);

    return (
        <Box
            sx={{
                height: '90vh',
                width: '100vw',
                bgcolor: darkMode ? '#ffffff' : '#ffffff',
                overflow: 'hidden',
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