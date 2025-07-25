/**
 * Page: CreateWorkshopForm.js
 * Purpose: Create a new workshop with sections & quiz questions
 * Location: /src/pages/CreateWorkshopForm.js
 */

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import axios from "axios";

export default function CreateWorkshopForm({ onSuccess, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trainerId, setTrainerId] = useState(1); // In future, get from logged-in user

  const [sections, setSections] = useState([
    { title: "", ppt_url: "", code: "", questions: [] },
  ]);

  /** Add a new section */
  const handleAddSection = () => {
    setSections([
      ...sections,
      { title: "", ppt_url: "", code: "", questions: [] },
    ]);
  };

  /** Change section fields */
  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  /** Add a question to a section */
  const handleAddQuestion = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].questions.push({
      question: "",
      options: { A: "", B: "", C: "", D: "" },
      answer: "",
      explanation: "",
    });
    setSections(updated);
  };

  /** Change question fields */
  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex][field] = value;
    setSections(updated);
  };

  /** Change question options */
  const handleOptionChange = (sIndex, qIndex, optKey, value) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex].options[optKey] = value;
    setSections(updated);
  };

  /** Submit to backend */
  const handleSubmit = async () => {
    const payload = {
      title,
      description,
      trainer_id: trainerId,
      sections,
    };

    try {
      await axios.post("http://127.0.0.1:8001/workshops/", payload);
      alert("✅ Workshop created successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create workshop! Check console for errors.");
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Create Workshop
      </Typography>

      <TextField
        label="Title"
        fullWidth
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Sections & Questions
      </Typography>

      {sections.map((section, sIndex) => (
        <Paper key={sIndex} sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}>
          <TextField
            label="Section Title"
            fullWidth
            sx={{ mb: 1 }}
            value={section.title}
            onChange={(e) =>
              handleSectionChange(sIndex, "title", e.target.value)
            }
          />
          <TextField
            label="PPT URL"
            fullWidth
            sx={{ mb: 1 }}
            value={section.ppt_url}
            onChange={(e) =>
              handleSectionChange(sIndex, "ppt_url", e.target.value)
            }
          />
          <TextField
            label="Code (optional)"
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
            value={section.code}
            onChange={(e) =>
              handleSectionChange(sIndex, "code", e.target.value)
            }
          />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Questions
          </Typography>
          {section.questions.map((q, qIndex) => (
            <Paper key={qIndex} sx={{ p: 2, mb: 1, border: "1px solid #ddd" }}>
              <TextField
                label="Question"
                fullWidth
                sx={{ mb: 1 }}
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(sIndex, qIndex, "question", e.target.value)
                }
              />

              <Grid container spacing={1}>
                {["A", "B", "C", "D"].map((opt) => (
                  <Grid item xs={6} key={opt}>
                    <TextField
                      label={`Option ${opt}`}
                      fullWidth
                      value={q.options[opt]}
                      onChange={(e) =>
                        handleOptionChange(sIndex, qIndex, opt, e.target.value)
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <TextField
                label="Correct Answer (A/B/C/D)"
                fullWidth
                sx={{ mt: 1 }}
                value={q.answer}
                onChange={(e) =>
                  handleQuestionChange(sIndex, qIndex, "answer", e.target.value)
                }
              />
              <TextField
                label="Explanation"
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 1 }}
                value={q.explanation}
                onChange={(e) =>
                  handleQuestionChange(sIndex, qIndex, "explanation", e.target.value)
                }
              />
            </Paper>
          ))}

          <Button
            variant="outlined"
            size="small"
            onClick={() => handleAddQuestion(sIndex)}
          >
            + Add Question
          </Button>
        </Paper>
      ))}

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleAddSection}
        sx={{ mb: 2 }}
      >
        + Add Section
      </Button>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Workshop
        </Button>
        <Button variant="text" color="error" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
