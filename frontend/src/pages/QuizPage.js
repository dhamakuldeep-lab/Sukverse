import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Navbar from '../components/Navbar';
import workshops from '../data/workshops';

/**
 * Practice quiz page for a workshop.  Shows one question at a time with
 * multiple choice answers and instant feedback.  After completing
 * all questions the user is encouraged to proceed to the final
 * certification quiz.
 */
export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workshop = workshops.find((w) => w.id.toString() === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!workshop) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Workshop not found</Typography>
      </Box>
    );
  }

  const questions = workshop.questions;
  const question = questions[currentIndex];

  const handleSubmit = () => {
    // Check if selected answer is correct
    const correct = selected === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    // Reset feedback and move to next question
    setShowFeedback(false);
    setSelected('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If last question, navigate to final quiz page or show completion message
      navigate(`/workshops/${id}/final-quiz`);
    }
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>Practice Quiz</Typography>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {question.question}
            </Typography>
            <RadioGroup
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {Object.entries(question.options).map(([key, text]) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={`${key}: ${text}`}
                  disabled={showFeedback}
                />
              ))}
            </RadioGroup>
            {!showFeedback ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selected}
                sx={{ mt: 2 }}
              >
                Submit
              </Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
                  {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.answer}.`}
                </Typography>
                <Button variant="outlined" onClick={handleNext} sx={{ mt: 1 }}>
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Go to Certification Quiz'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}