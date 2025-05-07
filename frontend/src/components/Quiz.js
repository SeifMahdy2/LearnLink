import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  Card,
  CardContent,
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  TextField,
  Divider,
  useTheme,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CheckCircleOutline as CorrectIcon,
  Cancel as IncorrectIcon,
  Lightbulb as HintIcon,
  Refresh as ResetIcon,
  Image as ImageIcon,
  QuizOutlined as QuizIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { saveQuizScore } from '../services/quizService';

// Mock API endpoint base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const Quiz = ({ fileId, title = 'Quiz', quizType = 'multiple_choice', isDialog = false }) => {
  const theme = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', type: 'info' });
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        // For demo purposes, using a timeout to simulate API call
        setTimeout(() => {
          // Mock quiz data
          setQuiz({
            questions: [
              {
                id: 1,
                question: 'What is the main purpose of this document?',
                options: [
                  'To provide information about a specific topic',
                  'To persuade the reader to take action',
                  'To entertain the reader with a story',
                  'To instruct the reader on how to do something'
                ],
                correctAnswer: 0
              },
              {
                id: 2,
                question: 'Which of the following concepts is mentioned in the document?',
                options: [
                  'Machine Learning',
                  'Climate Change',
                  'Economic Theory',
                  'Medical Research'
                ],
                correctAnswer: 1
              },
              {
                id: 3,
                question: 'According to the document, what is a key factor in understanding the topic?',
                options: [
                  'Historical context',
                  'Political implications',
                  'Scientific evidence',
                  'Cultural significance'
                ],
                correctAnswer: 2
              },
              {
                id: 4,
                question: 'What type of information is primarily presented in this document?',
                options: [
                  'Statistical data',
                  'Personal anecdotes',
                  'Expert opinions',
                  'Factual statements'
                ],
                correctAnswer: 3
              },
              {
                id: 5,
                question: 'Which conclusion can be drawn from the document?',
                options: [
                  'More research is needed',
                  'The issue is resolved',
                  'The topic is controversial',
                  'The information is outdated'
                ],
                correctAnswer: 0
              }
            ]
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    };

    if (fileId) {
      fetchQuiz();
    }
  }, [fileId]);

  const handleAnswerSelect = (event) => {
    if (quizType === 'multiple_choice') {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: parseInt(event.target.value)
      });
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: event.target.value
      });
    }
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    
    // Calculate score
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    const scoreData = {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
    
    setScore(scoreData);
    
    // Create quiz data object with proper timestamp
    const quizData = {
      quizId: fileId || `quiz_${Date.now()}`,
      quizName: `${title} ${new Date().toLocaleDateString()}`,
      score: correct,
      correctAnswers: correct,
      totalQuestions: quiz.questions.length,
      percentage: scoreData.percentage,
      documentId: fileId,
      timestamp: new Date().toISOString()
    };
    
    try {
      console.log("Submitting quiz with data:", quizData);
      
      // Save to localStorage directly as a backup method
      try {
        const existingQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
        existingQuizzes.push(quizData);
        localStorage.setItem('completedQuizzes', JSON.stringify(existingQuizzes));
        console.log("Quiz saved directly to localStorage, count:", existingQuizzes.length);
      } catch (err) {
        console.error("Error saving directly to localStorage:", err);
      }
      
      // Dispatch quizSubmitted custom event for Dashboard to detect and save locally
      const quizSubmittedEvent = new CustomEvent('quizSubmitted', {
        detail: quizData,
        bubbles: true,  // Make sure event bubbles up
        cancelable: true
      });
      
      const dispatched = window.dispatchEvent(quizSubmittedEvent);
      console.log('Quiz submitted event dispatched:', dispatched);
      
      if (dispatched) {
        setSaveStatus({
          show: true,
          message: 'Quiz score saved successfully!',
          type: 'success'
        });
      } else {
        throw new Error("Failed to dispatch event");
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
      setSaveStatus({
        show: true,
        message: 'Error saving quiz score: ' + error.message,
        type: 'error'
      });
    }
    
    // Notify user to check dashboard
    setTimeout(() => {
      if (setSaveStatus) {
        setSaveStatus({
          show: true,
          message: 'Quiz completed! Check the dashboard to see your progress.',
          type: 'success'
        });
      }
    }, 3000);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setScore(null);
  };
  
  const handleSnackbarClose = () => {
    setSaveStatus({ ...saveStatus, show: false });
  };

  // Adjust container styles based on whether the component is in a dialog
  const containerSx = isDialog 
    ? { width: '100%' } 
    : { maxWidth: 900, mx: 'auto', p: 3 };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: isDialog ? '300px' : '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={containerSx}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Box sx={{ 
        ...containerSx,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        pt: 8
      }}>
        <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom textAlign="center">
          No Quiz Available
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          This document doesn't have a quiz yet. Try processing the document first.
        </Typography>
      </Box>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <Box sx={containerSx}>
      {submitted && score ? (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h5" gutterBottom align="center">
              Quiz Results
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                my: 3 
              }}
            >
              <Box 
                sx={{ 
                  position: 'relative', 
                  display: 'inline-flex',
                  mb: 2
                }}
              >
                <CircularProgress 
                  variant="determinate" 
                  value={score.percentage} 
                  size={80}
                  thickness={4}
                  sx={{
                    color: score.percentage >= 70 
                      ? 'success.main' 
                      : score.percentage >= 40 
                        ? 'warning.main' 
                        : 'error.main',
                  }}
                />
                
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {score.percentage}%
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6">
                {score.correct} / {score.total} Correct
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {score.percentage >= 70 
                  ? 'Great job! You have a good understanding of the material.' 
                  : score.percentage >= 40 
                    ? 'Good effort! You might want to review some sections again.' 
                    : 'You should consider reviewing the material again.'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Question Review
            </Typography>
            
            {quiz.questions.map((question, index) => (
              <Card 
                key={question.id} 
                variant="outlined"
                sx={{ 
                  mb: 2,
                  borderColor: selectedAnswers[index] === question.correctAnswer 
                    ? 'success.light' 
                    : 'error.light'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    {selectedAnswers[index] === question.correctAnswer 
                      ? <CorrectIcon color="success" sx={{ mr: 1 }} /> 
                      : <IncorrectIcon color="error" sx={{ mr: 1 }} />}
                    <Box>
                      <Typography variant="subtitle1">
                        {index + 1}. {question.question}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your answer: {question.options[selectedAnswers[index] || 0]}
                      </Typography>
                      
                      {selectedAnswers[index] !== question.correctAnswer && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                          Correct answer: {question.options[question.correctAnswer]}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ResetIcon />}
                onClick={handleRestart}
                sx={{ borderRadius: 2 }}
              >
                Take Quiz Again
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                {title}
              </Typography>
              
              <Chip 
                label={`${currentQuestion + 1} of ${quiz.questions.length}`} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestion / (quiz.questions.length - 1)) * 100} 
              sx={{ mb: 3, height: 6, borderRadius: 3 }} 
            />
            
            <Box sx={{ mb: 4 }}>
              {quizType === 'multiple_choice' ? (
                // Multiple choice question display
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {currentQuestionData.question}
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                    <RadioGroup
                      name="quiz-options"
                      value={selectedAnswers[currentQuestion] !== undefined ? selectedAnswers[currentQuestion].toString() : ''}
                      onChange={handleAnswerSelect}
                    >
                      {currentQuestionData.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          value={index.toString()}
                          control={<Radio />}
                          label={option}
                          sx={{
                            mb: 1,
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            width: '100%',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            }
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </>
              ) : (
                // Fill in the blank question display
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Fill in the blank:
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      flexWrap: 'wrap',
                      mt: 2,
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography 
                      component="span"
                      variant="body1" 
                      sx={{ 
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        fontWeight: 500,
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      {currentQuestionData.text_before_blank}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      mx: 1,
                      minWidth: '120px',
                      maxWidth: '180px'
                    }}>
                      <TextField
                        variant="standard"
                        placeholder="_____"
                        value={selectedAnswers[currentQuestion] || ''}
                        onChange={handleAnswerSelect}
                        fullWidth
                        sx={{
                          width: '100%',
                          '& .MuiInput-root': {
                            fontSize: '1.1rem',
                            fontWeight: 500
                          },
                          '& .MuiInput-input': {
                            textAlign: 'center'
                          },
                          '& .MuiInput-underline:before': {
                            borderBottomStyle: 'solid',
                            borderBottomWidth: '2px'
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: theme.palette.primary.main
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      component="span"
                      variant="body1" 
                      sx={{ 
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        fontWeight: 500,
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      {currentQuestionData.text_after_blank}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon />}
                onClick={() => navigateToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>
              
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  onClick={() => navigateToQuestion(currentQuestion + 1)}
                  sx={{ borderRadius: 2 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                  sx={{ borderRadius: 2 }}
                >
                  Submit Quiz
                </Button>
              )}
            </Box>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Question Navigator
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quiz.questions.map((question, index) => (
                <Button
                  key={index}
                  variant={currentQuestion === index ? "contained" : "outlined"}
                  size="small"
                  color={selectedAnswers[index] !== undefined ? "primary" : "inherit"}
                  onClick={() => navigateToQuestion(index)}
                  sx={{
                    minWidth: '36px',
                    width: '36px',
                    height: '36px',
                    p: 0,
                    borderRadius: '50%'
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Notification for score saving */}
      <Snackbar
        open={saveStatus.show}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={saveStatus.type} 
          sx={{ width: '100%' }}
        >
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Quiz; 