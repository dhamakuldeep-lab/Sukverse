import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { Link, useLocation } from 'react-router-dom';

// Simple sidebar component that receives a list of items and renders
// them using a Material UI Drawer.  The drawer is permanently
// displayed on the left side of the screen on desktop.  On mobile,
// improvements would require a responsive drawer.
export default function Sidebar({ items }) {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <ToolbarPlaceholder />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}

// Placeholder for toolbar spacing in the drawer.  Without this,
// content would start under the navbar.
function ToolbarPlaceholder() {
  return <Box sx={{ height: 64 }}></Box>;
}