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
 * Certification quiz page.  The user answers all questions without
 * feedback and then submits to view their score.  Upon submission
 * they are navigated to the certificate page.
 */
export default function FinalQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workshop = workshops.find((w) => w.id.toString() === id);

  if (!workshop) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Workshop not found</Typography>
      </Box>
    );
  }

  const questions = workshop.finalQuestions;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct += 1;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>Certification Quiz</Typography>
        {submitted ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              You scored {score} out of {questions.length}.
            </Typography>
            <Button variant="contained" onClick={() => navigate(`/workshops/${id}/certificate`)}>
              View Certificate
            </Button>
          </Box>
        ) : (
          <Box>
            {questions.map((q, index) => (
              <Card key={q.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {index + 1} of {questions.length}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {q.question}
                  </Typography>
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onChange={(e) => handleSelect(q.id, e.target.value)}
                    >
                      {Object.entries(q.options).map(([key, text]) => (
                        <FormControlLabel
                          key={key}
                          value={key}
                          control={<Radio />}
                          label={`${key}: ${text}`}
                        />
                      ))}
                    </RadioGroup>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Submit
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}