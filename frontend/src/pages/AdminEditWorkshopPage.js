import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  createSection,
  deleteSection,
} from '../api/workshopApi';

/**
 * Admin page for creating a new workshop or editing an existing one.  When
 * editing, it fetches the workshop details including sections.  The form
 * allows updating basic workshop fields and provides a simple interface
 * to add or remove sections.  Detailed editing of a section (including
 * questions) is delegated to the AdminSectionPage.
 */
export default function AdminEditWorkshopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionPpt, setNewSectionPpt] = useState('');
  const [newSectionCode, setNewSectionCode] = useState('');

  useEffect(() => {
    if (editing) {
      loadWorkshop();
    }
  }, [id]);

  const loadWorkshop = async () => {
    try {
      const data = await getWorkshop(id);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setTrainerId(String(data.trainer_id));
      setSections(data.sections || []);
    } catch (err) {
      console.error('Failed to load workshop', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      trainer_id: parseInt(trainerId, 10),
    };
    try {
      if (editing) {
        await updateWorkshop(id, payload);
        alert('Workshop updated');
      } else {
        // For create, we also need to send sections.  New workshops can be
        // created without sections and added later.
        const newWorkshop = await createWorkshop({ ...payload, sections: [] });
        alert('Workshop created');
        navigate(`/admin/workshops/edit/${newWorkshop.id}`);
        return;
      }
      navigate('/admin/workshops');
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save workshop');
    }
  };

  const handleAddSection = async () => {
    if (!editing) {
      alert('You must save the workshop before adding sections');
      return;
    }
    if (!newSectionTitle) {
      alert('Enter a section title');
      return;
    }
    try {
      const section = {
        title: newSectionTitle,
        ppt_url: newSectionPpt || null,
        code: newSectionCode || null,
        questions: [],
      };
      const created = await createSection(id, section);
      setSections((prev) => [...prev, created]);
      setNewSectionTitle('');
      setNewSectionPpt('');
      setNewSectionCode('');
    } catch (err) {
      console.error('Failed to add section', err);
      alert('Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await deleteSection(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (err) {
      console.error('Delete section failed', err);
      alert('Failed to delete section');
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
          {editing ? 'Edit Workshop' : 'Create Workshop'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            required
          />
          <TextField
            label="Trainer ID"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {editing ? 'Save' : 'Create'}
          </Button>
        </form>

        {editing && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sections
            </Typography>
            <List>
              {sections.map((sec) => (
                <React.Fragment key={sec.id}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <Button size="small" onClick={() => navigate(`/admin/sections/edit/${sec.id}/${id}`)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteSection(sec.id)}>
                          Delete
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText primary={sec.title} secondary={`Questions: ${sec.questions.length}`} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {sections.length === 0 && <Typography>No sections yet.</Typography>}
            </List>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Add New Section
            </Typography>
            <TextField
              label="Section Title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="PPT URL"
              value={newSectionPpt}
              onChange={(e) => setNewSectionPpt(e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Code (optional)"
              value={newSectionCode}
              onChange={(e) => setNewSectionCode(e.target.value)}
              fullWidth
              margin="dense"
            />
            <Button variant="outlined" onClick={handleAddSection} sx={{ mt: 1 }}>
              Add Section
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}