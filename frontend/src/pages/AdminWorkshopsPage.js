import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getWorkshops, deleteWorkshop } from '../api/workshopApi';

/**
 * Admin page to list all workshops.  Provides actions to create a new
 * workshop, edit existing ones, or delete them entirely.  Uses the
 * workshop microservice API to fetch data and perform mutations.
 */
export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const data = await getWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Failed to load workshops', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      await deleteWorkshop(id);
      setWorkshops((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete workshop');
    }
  };

  const menuItems = [
    { label: 'Users', path: '/admin/users' },
    { label: 'Roles', path: '/admin/roles' },
    { label: 'Workshops', path: '/admin/workshops' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Manage Workshops
        </Typography>
        <Button variant="contained" onClick={() => navigate('/admin/workshops/create')} sx={{ mb: 2 }}>
          Create New Workshop
        </Button>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Trainer ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workshops.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.title}</TableCell>
                  <TableCell>{w.description}</TableCell>
                  <TableCell>{w.trainer_id}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/admin/workshops/edit/${w.id}`)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(w.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {workshops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No workshops found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}