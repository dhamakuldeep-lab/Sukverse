import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { UserContext } from '../contexts/UserContext';

// Admin panel entry point.  It displays a sidebar with navigation to
// user management and role management pages.  The central area
// renders the child route content.
export default function AdminPanel() {
  const { currentUser } = useContext(UserContext);
  const menuItems = [
    { label: 'User List', path: '/admin/users' },
    { label: 'Role Management', path: '/admin/roles' },
    { label: 'Workshops', path: '/admin/workshops' },
  ];

  // Prevent non‑admin users from accessing this page
  if (!currentUser || !currentUser.is_admin) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Access Denied</Typography>
        <Typography>You must be an admin to view this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>Admin Panel</Typography>
        <Typography variant="body1" gutterBottom>
          Use the menu to manage users and roles.
        </Typography>
        {/* Render nested routes here */}
        <Outlet />
      </Box>
    </Box>
  );
}