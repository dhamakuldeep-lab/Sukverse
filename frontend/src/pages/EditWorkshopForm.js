/**
 * Page: EditWorkshopForm.js
 * Purpose: Edit an existing workshop (title, description, sections & questions)
 * Location: /src/pages/EditWorkshopForm.js
 */

import React, { useEffect, useState } from "react";
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

export default function EditWorkshopForm({ workshopId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);

  /** Fetch workshop data */
  const fetchWorkshop = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8001/workshops/${workshopId}`);
      setTitle(response.data.title);
      setDescription(response.data.description);
      setSections(
        response.data.sections.map((s) => ({
          ...s,
          questions:
            s.questions?.map((q) => ({
              ...q,
              options: q.options || { A: "", B: "", C: "", D: "" },
            })) || [],
        }))
      );
    } catch (err) {
      console.error("Failed to load workshop", err);
      alert("❌ Failed to load workshop data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshop();
  }, [workshopId]);

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex][field] = value;
    setSections(updated);
  };

  const handleOptionChange = (sIndex, qIndex, optKey, value) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex].options[optKey] = value;
    setSections(updated);
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      { title: "", ppt_url: "", code: "", questions: [] },
    ]);
  };

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

  /** Save updated workshop */
  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8001/workshops/${workshopId}`, {
        title,
        description,
        trainer_id: 1, // keep consistent with backend
      });
      alert("✅ Workshop updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update workshop!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Edit Workshop
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
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
                label="Code"
                fullWidth
                multiline
                rows={2}
                value={section.code}
                onChange={(e) =>
                  handleSectionChange(sIndex, "code", e.target.value)
                }
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Questions
              </Typography>
              {section.questions.map((q, qIndex) => (
                <Paper
                  key={qIndex}
                  sx={{ p: 2, mb: 1, border: "1px solid #ddd" }}
                >
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
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="text" color="error" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
