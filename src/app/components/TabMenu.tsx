import React from "react";
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface TabMenuProps {
    open: boolean;
    tabValue: number;
    handleTabChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ open, tabValue, handleTabChange}) => {
    return (
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ width: '100%', bgcolor: 'background.default', marginBottom: '1%', paddingX: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="secondary"
                >
                    <Tab label="Visualization" />
                    <Tab label="Styling Options" />
                    <Tab label="OCPN Options" />
                    <Tab label="Editor" />
                </Tabs>
            </Box>
        </Collapse>
    );
};

export default TabMenu;