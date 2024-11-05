import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';

interface HeaderProps {
    onMenuClick: () => void;
    onImportClick: () => void;
    onExportClick: () => void;
    onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onImportClick, onExportClick, onToggleDarkMode }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    OCPN Visualizer
                </Typography>
                <Button color="inherit" onClick={onImportClick}>Import</Button>
                <Button color="inherit" onClick={onExportClick}>Export</Button>
                <IconButton edge="end" color="inherit" aria-label="toggle dark mode" onClick={onToggleDarkMode}>
                    <Brightness4Icon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;