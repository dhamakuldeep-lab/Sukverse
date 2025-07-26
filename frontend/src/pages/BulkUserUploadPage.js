import React, { useState } from 'react';
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

// Page allowing admins to select a CSV file, preview its contents and
// submit it for upload.  For now the Upload button does not send the
// data anywhere.
export default function BulkUserUploadPage() {
  const [rows, setRows] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.trim().split(/\r?\n/).map((line) => line.split(','));
      setRows(lines);
    };
    reader.readAsText(file);
  };

  const menuItems = [
    { label: 'User List', path: '/admin/users' },
    { label: 'Add User', path: '/admin/users/add' },
    { label: 'Role Management', path: '/admin/roles' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>Bulk User Upload</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" component="label">
            Choose CSV
            <input type="file" accept=".csv" hidden onChange={handleFileChange} />
          </Button>
          <Button variant="contained" color="primary">Upload</Button>
        </Box>
        {rows.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {rows[0].map((_, idx) => (
                    <TableCell key={idx}>Column {idx + 1}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((cols, idx) => (
                  <TableRow key={idx}>
                    {cols.map((col, cidx) => (
                      <TableCell key={cidx}>{col}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
