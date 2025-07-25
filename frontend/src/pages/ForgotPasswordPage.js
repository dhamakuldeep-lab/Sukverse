import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { forgotPassword } from '../api/authApi';

// Simple forgot password page.  It collects an email and displays a
// confirmation message.  No actual reset functionality is implemented.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to initiate password reset', err);
      alert('Failed to initiate password reset: ' + err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" gutterBottom>Forgot Password</Typography>
        {!submitted ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Reset Password
            </Button>
            <Box sx={{ mt: 1 }}>
              <Link to="/login">Back to Login</Link>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ mt: 2 }}>If an account exists for {email}, a password reset link has been sent.</Typography>
        )}
      </Paper>
    </Box>
  );
}