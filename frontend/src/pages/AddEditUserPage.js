import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getUserById, adminUpdateUser } from '../api/authApi';

// Page for adding or editing a user.  If an id param is present, the form
// is prepopulated with that user's data.  Changes are not persisted
// beyond this session.
export default function AddEditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({ username: '', email: '', role: 'student', status: 'active' });

  useEffect(() => {
    // Fetch user details if editing
    const fetchUser = async () => {
      if (isEdit) {
        try {
          const user = await getUserById(id, localStorage.getItem('access_token'));
          setFormData({
            username: user.username || '',
            email: user.email,
            role: user.is_admin ? 'admin' : 'student',
            status: user.is_active ? 'active' : 'inactive',
          });
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
    };
    fetchUser();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build payload for admin update
    const payload = {
      email: formData.email,
      username: formData.username,
      is_admin: formData.role === 'admin',
      is_active: formData.status === 'active',
    };
    try {
      await adminUpdateUser(id, payload, localStorage.getItem('access_token'));
      navigate('/admin/users');
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={[{ label: 'User List', path: '/admin/users' }, { label: 'Add User', path: '/admin/users/add' }, { label: 'Role Management', path: '/admin/roles' }]} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>{isEdit ? 'Edit User' : 'Add User'}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">Save</Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/users')}>Cancel</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}