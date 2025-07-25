import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Navbar from '../components/Navbar';

// A simple Python editor simulation.  Users can edit the preloaded code
// and click "Run" to see a dummy output.  Real execution is not
// implemented for security reasons.
export default function PythonEditorPage() {
  const { id } = useParams();
  const [code, setCode] = useState('print("Hello Healthcare AI")');
  const [output, setOutput] = useState('');

  const handleRun = () => {
    // Simulate code execution.  A real implementation would call a
    // backend service to execute the Python code.
    setOutput('Hello Healthcare AI');
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Python Editor</Typography>
        <Typography variant="body2" gutterBottom>
          You are practicing for workshop #{id}. Edit the code below and click
          run to see the simulated output.
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            label="Python Code"
            multiline
            minRows={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleRun}>Run</Button>
          {output && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Output:</Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>{output}</Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}