import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import workshops from "../data/workshops";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

/**
 * SectionPage displays a single section within a workshop.  It shows
 * the section’s title, a link to its PPT, a simple Python editor with
 * starter code, and a quiz.  Students must answer each question
 * correctly before moving on.  When all questions are answered
 * correctly, a button appears to mark the section as completed.
 */
export default function SectionPage() {
  const { workshopId, sectionId } = useParams();
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const workshop = workshops.find((w) => w.id.toString() === workshopId);
  const section = workshop?.sections?.find((s) => s.id === sectionId);

  // State for code editor (not fully functional, just display starter code)
  const [code, setCode] = useState(section?.code || "");
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const progressKey = `progress_${currentUser?.id}_${workshopId}`;
    const progressData = JSON.parse(localStorage.getItem(progressKey) || "{}");
    if (progressData[sectionId]) {
      setCompleted(true);
    }
  }, [currentUser, workshopId, sectionId]);

  if (!workshop || !section) {
    return (
      <Box p={4}>
        <Typography variant="h6">Section not found.</Typography>
      </Box>
    );
  }

  const question = section.quiz[currentQuestionIndex];

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === question.answer) {
      // Correct
      setShowExplanation(false);
      setSelectedOption("");
      if (currentQuestionIndex < section.quiz.length - 1) {
        setCurrentQuestionIndex((idx) => idx + 1);
      } else {
        // Completed all questions
        setCompleted(true);
        // Save progress in localStorage
        const progressKey = `progress_${currentUser.id}_${workshopId}`;
        const progressData = JSON.parse(localStorage.getItem(progressKey) || "{}");
        progressData[sectionId] = true;
        localStorage.setItem(progressKey, JSON.stringify(progressData));
      }
    } else {
      // Incorrect, show explanation
      setShowExplanation(true);
    }
  };

  const handleFinishSection = () => {
    // After finishing, navigate back to the workshop detail page
    navigate(`/workshops/${workshopId}`);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {workshop.title} – {section.title}
      </Typography>
      {/* PPT link */}
      <Box mb={2}>
        <Typography variant="subtitle1">
          PPT: <a href={section.ppt} target="_blank" rel="noopener noreferrer">View Presentation</a>
        </Typography>
      </Box>
      {/* Code editor (read-only) */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Starter Code
        </Typography>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{code}</pre>
      </Paper>
      {/* Quiz section */}
      {!completed && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Quiz {currentQuestionIndex + 1} of {section.quiz.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {question.question}
          </Typography>
          <RadioGroup value={selectedOption} onChange={handleOptionChange}>
            {Object.entries(question.options).map(([key, text]) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio />}
                label={`${key}. ${text}`}
              />
            ))}
          </RadioGroup>
          {showExplanation && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Incorrect. {question.explanation}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
          >
            Submit Answer
          </Button>
        </Paper>
      )}
      {completed && (
        <Box mt={4}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Section completed! Great job.
          </Alert>
          <Button variant="contained" color="primary" onClick={handleFinishSection}>
            Back to Workshop
          </Button>
        </Box>
      )}
    </Box>
  );
}