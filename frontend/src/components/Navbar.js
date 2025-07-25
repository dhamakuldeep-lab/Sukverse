import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

// A simple top navigation bar that shows the application title and
// context‑aware links.  When a user is logged in, it shows their name
// and a logout button.  Otherwise it renders nothing.
export default function Navbar() {
  const { currentUser, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Workshop Learning Platform
          </Typography>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            {currentUser?.username || currentUser?.email} ({currentUser?.is_admin ? 'Admin' : 'User'})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}