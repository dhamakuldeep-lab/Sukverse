import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  getWorkshop,
  updateSection,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../api/workshopApi';

/**
 * Admin page to edit a section and manage its quiz questions.  The
 * section fields (title, PPT URL, code) can be updated, and new
 * questions can be added.  Existing questions are listed with
 * options to edit or delete.  When editing a question, simple
 * inline form controls are used.
 */
export default function AdminSectionPage() {
  const { sectionId, workshopId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionPpt, setSectionPpt] = useState('');
  const [sectionCode, setSectionCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: '', explanation: '' });
  const [editingQId, setEditingQId] = useState(null);
  const [editQ, setEditQ] = useState({ question: '', options: {}, answer: '', explanation: '' });

  useEffect(() => {
    loadSection();
  }, [sectionId, workshopId]);

  const loadSection = async () => {
    setLoading(true);
    try {
      const workshop = await getWorkshop(workshopId);
      const section = workshop.sections.find((s) => s.id.toString() === sectionId);
      if (!section) {
        alert('Section not found');
        navigate(`/admin/workshops/edit/${workshopId}`);
        return;
      }
      setSectionTitle(section.title || '');
      setSectionPpt(section.ppt_url || '');
      setSectionCode(section.code || '');
      setQuestions(section.questions || []);
    } catch (err) {
      console.error('Failed to load section', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    try {
      await updateSection(sectionId, { title: sectionTitle, ppt_url: sectionPpt, code: sectionCode });
      alert('Section updated');
      navigate(`/admin/workshops/edit/${workshopId}`);
    } catch (err) {
      console.error('Failed to update section', err);
      alert('Failed to update');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQ.question || !newQ.optionA || !newQ.optionB || !newQ.answer) {
      alert('Please fill at least the question, two options and answer');
      return;
    }
    const payload = {
      question: newQ.question,
      options: {
        A: newQ.optionA,
        B: newQ.optionB,
        ...(newQ.optionC ? { C: newQ.optionC } : {}),
        ...(newQ.optionD ? { D: newQ.optionD } : {}),
      },
      answer: newQ.answer,
      explanation: newQ.explanation || null,
    };
    try {
      const created = await createQuestion(sectionId, payload);
      setQuestions((prev) => [...prev, created]);
      setNewQ({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: '', explanation: '' });
    } catch (err) {
      console.error('Failed to add question', err);
      alert('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qid) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(qid);
      setQuestions((prev) => prev.filter((q) => q.id !== qid));
    } catch (err) {
      console.error('Failed to delete question', err);
      alert('Delete failed');
    }
  };

  const handleEditClick = (q) => {
    setEditingQId(q.id);
    setEditQ({ question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || '' });
  };

  const handleSaveQuestion = async () => {
    try {
      await updateQuestion(editingQId, editQ);
      // reload questions
      loadSection();
      setEditingQId(null);
    } catch (err) {
      console.error('Failed to update question', err);
      alert('Update failed');
    }
  };

  const menuItems = [
    { label: 'Users', path: '/admin/users' },
    { label: 'Roles', path: '/admin/roles' },
    { label: 'Workshops', path: '/admin/workshops' },
  ];

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar items={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Section
        </Typography>
        <TextField
          label="Section Title"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="PPT URL"
          value={sectionPpt}
          onChange={(e) => setSectionPpt(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Code"
          value={sectionCode}
          onChange={(e) => setSectionCode(e.target.value)}
          fullWidth
          margin="normal"
          multiline
        />
        <Button variant="contained" onClick={handleSaveSection} sx={{ mt: 2 }}>
          Save Section
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quiz Questions
          </Typography>
          <List>
            {questions.map((q) => (
              <React.Fragment key={q.id}>
                <ListItem>
                  <ListItemText
                    primary={q.question}
                    secondary={`Answer: ${q.answer}`}
                  />
                  <Box>
                    <Button size="small" onClick={() => handleEditClick(q)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteQuestion(q.id)}>
                      Delete
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {questions.length === 0 && <Typography>No questions yet.</Typography>}
          </List>

          {/* Edit existing question */}
          {editingQId && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Edit Question</Typography>
              <TextField
                label="Question"
                value={editQ.question}
                onChange={(e) => setEditQ((prev) => ({ ...prev, question: e.target.value }))}
                fullWidth
                margin="dense"
              />
              {/* Options editing: convert options object to text fields.  Only support A-D */}
              {['A', 'B', 'C', 'D'].map((key) => (
                <TextField
                  key={key}
                  label={`Option ${key}`}
                  value={editQ.options[key] || ''}
                  onChange={(e) =>
                    setEditQ((prev) => ({ ...prev, options: { ...prev.options, [key]: e.target.value } }))
                  }
                  fullWidth
                  margin="dense"
                />
              ))}
              <TextField
                label="Answer (letter)"
                value={editQ.answer}
                onChange={(e) => setEditQ((prev) => ({ ...prev, answer: e.target.value }))}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Explanation"
                value={editQ.explanation || ''}
                onChange={(e) => setEditQ((prev) => ({ ...prev, explanation: e.target.value }))}
                fullWidth
                margin="dense"
              />
              <Button variant="contained" onClick={handleSaveQuestion} sx={{ mt: 1 }}>
                Save Question
              </Button>
              <Button variant="text" onClick={() => setEditingQId(null)} sx={{ mt: 1, ml: 1 }}>
                Cancel
              </Button>
            </Box>
          )}

          {/* Add new question */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1">Add New Question</Typography>
            <TextField
              label="Question"
              value={newQ.question}
              onChange={(e) => setNewQ((prev) => ({ ...prev, question: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Option A"
              value={newQ.optionA}
              onChange={(e) => setNewQ((prev) => ({ ...prev, optionA: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Option B"
              value={newQ.optionB}
              onChange={(e) => setNewQ((prev) => ({ ...prev, optionB: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Option C"
              value={newQ.optionC}
              onChange={(e) => setNewQ((prev) => ({ ...prev, optionC: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Option D"
              value={newQ.optionD}
              onChange={(e) => setNewQ((prev) => ({ ...prev, optionD: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Answer (letter)"
              value={newQ.answer}
              onChange={(e) => setNewQ((prev) => ({ ...prev, answer: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Explanation"
              value={newQ.explanation}
              onChange={(e) => setNewQ((prev) => ({ ...prev, explanation: e.target.value }))}
              fullWidth
              margin="dense"
            />
            <Button variant="outlined" onClick={handleAddQuestion} sx={{ mt: 1 }}>
              Add Question
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}