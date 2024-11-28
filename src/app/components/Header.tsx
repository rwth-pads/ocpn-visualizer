import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { SelectChangeEvent } from '@mui/material/Select';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';

const ITEM_HEIGHT = 48;

interface HeaderProps {
    onMenuClick: () => void;
    onImportClick: () => void;
    onExportClick: () => void;
    onToggleDarkMode: () => void;
    darkMode: boolean;
    importedObjects: ObjectCentricPetriNet[];
    selectedOCPN: number | null;
    handleSelectChange: (event: SelectChangeEvent<number | "default">) => void;
}

const Header: React.FC<HeaderProps> = ({
    onMenuClick,
    onImportClick,
    onExportClick,
    onToggleDarkMode,
    darkMode,
    importedObjects,
    selectedOCPN,
    handleSelectChange
}) => {
    return (
        <AppBar position="static">
            <Toolbar sx={{ height: '10vh' }}>
                <IconButton color="inherit" aria-label="menu" onClick={onMenuClick}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div">
                    OCPN Visualizer
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Select
                        value={selectedOCPN !== null ? selectedOCPN : 'default'}
                        onChange={handleSelectChange}
                        displayEmpty
                        sx={{ margin: '0 10px', padding: '0 10px', minWidth: 200, bgcolor: darkMode ? '#212121' : '#2f5373', color: 'white' }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: darkMode ? '#212121' : '#2f5373',
                                    color: 'white',
                                    maxHeight: ITEM_HEIGHT * 10,
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                        height: '8px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: darkMode ? '#0d0d0d' : '#c7def2',
                                        borderRadius: '4px',
                                    },
                                },
                            }
                        }}
                    >
                        {importedObjects.length === 0 && (
                            <MenuItem value="default" disabled>
                                Import an OCPN
                            </MenuItem>
                        )}
                        {importedObjects.map((obj, index) => (
                            <MenuItem 
                                key={index}
                                value={index}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: darkMode ? '#000000' : '#002e57',
                                    },
                                }}>
                                {obj.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
                <Button color="inherit" onClick={onImportClick}>Import</Button>
                <Button color="inherit" onClick={onExportClick}>Export</Button>
                <IconButton edge="end" color="inherit" aria-label="toggle dark mode" onClick={onToggleDarkMode} sx={{ transform: 'scale(1)' }}>
                    <Brightness4Icon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;