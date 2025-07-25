import React, { useState } from 'react';
import { registerUser } from '../api/authApi'; // Ensure this is correctly implemented
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const [registrationError, setRegistrationError] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    setEmailError(false);
    setPasswordError(false);

    try {
      await registerUser({ name, email, password, role });
      navigate('/login');
    } catch (err) {
      console.error('Full error:', err);

      let errorMsg = 'Registration failed. Please try again.';
      const raw = err?.response?.data || err.message || err;

      try {
        if (typeof raw?.detail === 'string') {
          // Case: { detail: "User already exists" }
          errorMsg = raw.detail;
          if (raw.detail.toLowerCase().includes('already exists')) {
            setEmailError(true);
          }

        } else if (Array.isArray(raw?.detail)) {
          // Case: [{ msg: "...", loc: [...] }]
          const first = raw.detail[0];
          errorMsg = first?.msg || errorMsg;
          const loc = (first?.loc || []).join('.');
          if (loc.includes('email')) setEmailError(true);
          if (loc.includes('password')) setPasswordError(true);

        } else if (typeof raw === 'string') {
          // Fallback if it's a plain string error
          errorMsg = raw;
        }
      } catch (parseErr) {
        console.error('Error parsing backend error:', parseErr);
        errorMsg = 'Unexpected error. Please try again.';
      }

      setRegistrationError(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        {registrationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {registrationError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            fullWidth
            margin="normal"
            required
            error={emailError}
            helperText={emailError ? 'This email is already registered.' : ''}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            fullWidth
            margin="normal"
            required
            error={passwordError}
            helperText={passwordError ? 'Password must be at least 6 characters.' : ''}
          />
          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="trainer">Trainer</MenuItem>
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Register
          </Button>
          <Box sx={{ mt: 1 }}>
            <Link to="/login">Back to Login</Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
