import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Navbar from '../components/Navbar';
import { UserContext } from '../contexts/UserContext';
import workshops from '../data/workshops';

/**
 * Certificate display page.  Shows a simple certificate with the
 * student's name, workshop title, and current date.  Includes a
 * download button (dummy link).
 */
export default function CertificatePage() {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  const workshop = workshops.find((w) => w.id.toString() === id);

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!workshop) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Workshop not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Certificate of Completion</Typography>
          <Typography variant="body1" gutterBottom>This certifies that</Typography>
          <Typography variant="h6" gutterBottom>{currentUser?.name || 'Anonymous Student'}</Typography>
          <Typography variant="body1" gutterBottom>has successfully completed the workshop</Typography>
          <Typography variant="h6" gutterBottom>{workshop.title}</Typography>
          <Typography variant="body1" gutterBottom>on {dateStr}</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => alert('Download not implemented in demo')}>Download PDF</Button>
        </Paper>
      </Box>
    </Box>
  );
}