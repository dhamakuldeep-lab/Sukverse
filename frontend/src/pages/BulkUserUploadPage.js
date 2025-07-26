import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { registerUser } from '../api/authApi';

// Page for uploading a CSV of users and submitting them for creation.
export default function BulkUserUploadPage() {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [file, setFile] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];
    const cols = lines[0].split(',').map((h) => h.trim());
    setHeaders(cols);
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj = {};
      cols.forEach((h, idx) => {
        obj[h] = values[idx] ? values[idx].trim() : '';
      });
      return obj;
    });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setRows(parsed);
    };
    reader.readAsText(f);
  };

  const handleSubmit = async () => {
    for (const row of rows) {
      if (!row.email || !row.password) continue;
      try {
        await registerUser({ email: row.email, password: row.password });
      } catch (err) {
        console.error('Failed to create user', err);
      }
    }
    setRows([]);
    setFile(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={[
        { label: 'User List', path: '/admin/users' },
        { label: 'Add User', path: '/admin/users/add' },
        { label: 'Role Management', path: '/admin/roles' },
        { label: 'Bulk Upload', path: '/admin/users/bulk-upload' },
      ]} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>Bulk User Upload</Typography>
        <input type="file" accept=".csv" onChange={handleFileChange} data-testid="file-input" />
        {rows.length > 0 && (
          <>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headers.map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {headers.map((h) => (
                        <TableCell key={h}>{row[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>Submit</Button>
          </>
        )}
      </Box>
    </Box>
  );
}
