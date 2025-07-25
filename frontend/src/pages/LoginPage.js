import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { UserContext } from '../contexts/UserContext';

export default function LoginPage() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError(false);
    setPasswordError(false);

    try {
      const user = await login({ email, password });

      // ✅ Use role returned from backend to redirect
      if (user.role === 'admin') {
        navigate('/admin/workshops');
      } else if (user.role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error("Login Error:", err);

      let errorMsg = "Login failed. Please try again.";

      if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.detail) {
        errorMsg = err.detail;
      } else if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          errorMsg = parsed.detail || errorMsg;
        } catch {
          errorMsg = err.message;
        }
      }

      setError(errorMsg);

      if (errorMsg.toLowerCase().includes("password")) {
        setPasswordError(true);
      } else if (errorMsg.toLowerCase().includes("email")) {
        setEmailError(true);
      } else {
        setEmailError(true);
        setPasswordError(true);
      }
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
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/register">Register</Link>
            <Link to="/forgot-password">Forgot Password?</Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
