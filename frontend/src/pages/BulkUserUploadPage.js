import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { bulkRegisterUsers } from '../api/authApi';

export default function BulkUserUploadPage() {
  const [csv, setCsv] = useState('email,password,role\n');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rows = csv
      .trim()
      .split('\n')
      .slice(1) // skip header
      .filter(Boolean)
      .map((row) => {
        const [email, password, role] = row.split(',').map((s) => s.trim());
        return { email, password, role };
      });
    try {
      await bulkRegisterUsers(rows, localStorage.getItem('access_token'));
      setMessage('Users created successfully.');
      setCsv('email,password,role\n');
    } catch (err) {
      console.error(err);
      setMessage('Failed to create some users.');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar
        items={[
          { label: 'User List', path: '/admin/users' },
          { label: 'Add User', path: '/admin/users/add' },
          { label: 'Bulk Add', path: '/admin/users/bulk' },
          { label: 'Role Management', path: '/admin/roles' },
        ]}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Bulk User Upload
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Provide a CSV with columns: email,password,role
        </Typography>
        {message && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            multiline
            minRows={10}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Upload
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
