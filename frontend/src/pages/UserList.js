import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { UserContext } from '../contexts/UserContext';
import { getUsers, adminDeleteUser, bulkDeleteUsers } from '../api/authApi';

// Displays a list of users in a table with Edit/Delete actions.  This
// page is part of the admin module and includes the admin sidebar.
export default function UserList() {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // Fetch all users if current user is admin
    const fetchUsers = async () => {
      if (!currentUser) return;
      try {
        const data = await getUsers(localStorage.getItem('access_token'));
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await adminDeleteUser(id, localStorage.getItem('access_token'));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(users.map((u) => u.id));
    } else {
      setSelected([]);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteUsers(selected, localStorage.getItem('access_token'));
      setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
      setSelected([]);
    } catch (err) {
      console.error('Failed to delete users', err);
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
        <Typography variant="h5" gutterBottom>User List</Typography>
        {/* Admin can add new users by registering; create button removed */}
        {/* <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => navigate('/admin/users/add')}>
          Add User
        </Button> */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selected.length === users.length && users.length > 0}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selected.includes(user.id)}
                      onChange={() => handleSelect(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.username || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.is_admin ? 'Admin' : 'Student'}</TableCell>
                  <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/admin/users/edit/${user.id}`)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(user.id)}>
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selected.length > 0 && (
          <Button sx={{ mt: 2 }} color="error" variant="contained" onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        )}
      </Box>
    </Box>
  );
}