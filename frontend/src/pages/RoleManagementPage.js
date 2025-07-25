import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Role management page.  Lists available roles.  Adding or editing
// roles would normally be handled here, but for the purposes of this
// demo the roles are static.
export default function RoleManagementPage() {
  // Defined roles supported by the auth microservice.  In this simplified
  // version we only distinguish admin and student.  A future version could
  // add a trainer role or other permissions.
  const roles = ['student', 'admin'];
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={[{ label: 'User List', path: '/admin/users' }, { label: 'Add User', path: '/admin/users/add' }, { label: 'Role Management', path: '/admin/roles' }]} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>Role Management</Typography>
        <Typography variant="body1" gutterBottom>
          The following roles are currently available.  You can customise these
          roles in a future version of this app.
        </Typography>
        <List>
          {roles.map((role) => (
            <ListItem key={role}>
              <ListItemText primary={role.charAt(0).toUpperCase() + role.slice(1)} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}