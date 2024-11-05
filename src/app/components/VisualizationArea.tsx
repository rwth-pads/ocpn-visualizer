import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface VisualizationAreaProps {

}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ }) => {
    return (
        <Box
            sx={{
                border: '2px dotted',
                borderColor: 'primary.main',
                borderRadius: 0,
                m: 2,
                p: 2,
                overflow: 'auto',
                position: 'relative',
            }}
        >
            <Typography variant="h6">Visualization</Typography>
        </Box>
    );
};

export default VisualizationArea;