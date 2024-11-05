import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';

interface EditorProps {
    importedObjects: ObjectCentricPetriNet[];
    selectedOCPN: number | null;
    onListItemClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void;
}

const Editor: React.FC<EditorProps> = ({ importedObjects, selectedOCPN, onListItemClick }) => {
    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', m: 0, p: 0 }}>
            <List sx={{ m: 0, p: 0 }}>
                {importedObjects.map((obj, index) => (
                    <ListItemButton
                        key={index}
                        selected={selectedOCPN === index}
                        onClick={(event) => onListItemClick(event, index)}
                        sx={{ marginY: 1, bgcolor: selectedOCPN === index ? 'background.default' : 'background.paper' }}
                    >
                        <ListItemText primary={obj.name} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
};

export default Editor;