import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import workshops from '../data/workshops';
import { UserContext } from '../contexts/UserContext';

// Dashboard for students.  Lists workshops that the current user is
// enrolled in and provides a button to join or view details.
export default function StudentDashboard() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Determine workshops for the current user.  In this demo we don't
  // have user IDs on currentUser; instead we show all workshops for
  // demonstration purposes.
  const myWorkshops = workshops;

  const menuItems = [
    { label: 'My Workshops', path: '/student/dashboard' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>My Workshops</Typography>
        <Grid container spacing={2}>
          {myWorkshops.map((workshop) => (
            <Grid item xs={12} md={6} key={workshop.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{workshop.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trainer: {workshop.trainerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Session: {workshop.nextSession}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/workshops/${workshop.id}`)}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}