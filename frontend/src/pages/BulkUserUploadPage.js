import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bulkRegisterUsers, registerUser } from '../api/authApi';

export default function BulkUserUploadPage() {
  const [csv, setCsv] = useState('email,password,role\n');
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [file, setFile] = useState(null);

  const sidebarItems = [
    { label: 'User List', path: '/admin/users' },
    { label: 'Add User', path: '/admin/users/add' },
    { label: 'Bulk Upload', path: '/admin/users/bulk-upload' },
    { label: 'Role Management', path: '/admin/roles' },
  ];

  // File parsing
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

  const handleFileSubmit = async () => {
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
    setMessage('File-based users uploaded successfully.');
  };

  const handleTextareaSubmit = async (e) => {
    e.preventDefault();
    const manualRows = csv
      .trim()
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const [email, password, role] = line.split(',').map((s) => s.trim());
        return { email, password, role };
      });

    try {
      await bulkRegisterUsers(manualRows, localStorage.getItem('access_token'));
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
      <Sidebar items={sidebarItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>Bulk User Upload</Typography>

        {message && (
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'green' }}>
            {message}
          </Typography>
        )}

        {/* Manual Textarea Upload */}
        <Typography variant="body2" sx={{ mb: 1 }}>
          Provide a CSV with columns: <strong>email,password,role</strong>
        </Typography>
        <Box component="form" onSubmit={handleTextareaSubmit} sx={{ mb: 4 }}>
          <TextField
            multiline
            minRows={10}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">Upload from Text</Button>
        </Box>

        {/* File Upload */}
        <Typography variant="body2">Or upload CSV file:</Typography>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          data-testid="file-input"
          style={{ marginTop: '10px', marginBottom: '20px' }}
        />
        {rows.length > 0 && (
          <>
            <TableContainer component={Paper}>
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
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleFileSubmit}>
              Submit File Users
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
