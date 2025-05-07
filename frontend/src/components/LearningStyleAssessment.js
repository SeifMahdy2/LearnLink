import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Visibility as VisualIcon,
  Hearing as AuditoryIcon,
  Create as WritingIcon,
  DirectionsRun as KinestheticIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../services/authService';

const LearningStyleAssessment = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({
    Visual: 0,
    Auditory: 0,
    'Reading/Writing': 0,
    Kinesthetic: 0
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Learning style questions
  const questions = [
    {
      id: 1,
      text: "When learning something new, I prefer to:",
      options: [
        { text: "See diagrams, videos, or demonstrations", style: "Visual" },
        { text: "Listen to explanations and discuss the topic", style: "Auditory" },
        { text: "Read written instructions and take notes", style: "Reading/Writing" },
        { text: "Try it hands-on and learn by doing", style: "Kinesthetic" }
      ]
    },
    {
      id: 2,
      text: "When trying to remember something, I typically:",
      options: [
        { text: "Recall what the information looked like visually", style: "Visual" },
        { text: "Remember what was said and repeat it to myself", style: "Auditory" },
        { text: "Review my written notes or reference material", style: "Reading/Writing" },
        { text: "Recreate the movements or experience", style: "Kinesthetic" }
      ]
    },
    {
      id: 3,
      text: "I find it easiest to follow:",
      options: [
        { text: "Visual presentations with charts and images", style: "Visual" },
        { text: "Verbal instructions and discussions", style: "Auditory" },
        { text: "Written instructions and text", style: "Reading/Writing" },
        { text: "Demonstrations where I can try for myself", style: "Kinesthetic" }
      ]
    },
    {
      id: 4,
      text: "When giving directions to someone, I would rather:",
      options: [
        { text: "Draw a map or show pictures", style: "Visual" },
        { text: "Explain verbally over the phone", style: "Auditory" },
        { text: "Write detailed step-by-step instructions", style: "Reading/Writing" },
        { text: "Walk with them and show the way physically", style: "Kinesthetic" }
      ]
    },
    {
      id: 5,
      text: "When preparing for a test or exam, I prefer to:",
      options: [
        { text: "Make visual aids like charts, diagrams, or flashcards", style: "Visual" },
        { text: "Discuss the material with others or record myself", style: "Auditory" },
        { text: "Write summaries and review my notes", style: "Reading/Writing" },
        { text: "Use role-play or practice real applications", style: "Kinesthetic" }
      ]
    },
    {
      id: 6,
      text: "During free time, I often enjoy:",
      options: [
        { text: "Watching videos or looking at images", style: "Visual" },
        { text: "Listening to podcasts or music", style: "Auditory" },
        { text: "Reading books or articles", style: "Reading/Writing" },
        { text: "Playing sports or making things with my hands", style: "Kinesthetic" }
      ]
    },
    {
      id: 7,
      text: "When solving a problem, I tend to:",
      options: [
        { text: "Visualize the solution or create diagrams", style: "Visual" },
        { text: "Talk through the problem out loud", style: "Auditory" },
        { text: "List the steps or pros and cons in writing", style: "Reading/Writing" },
        { text: "Use a trial-and-error approach", style: "Kinesthetic" }
      ]
    },
    {
      id: 8,
      text: "I find it easiest to remember people's names by:",
      options: [
        { text: "Recalling their face or what they looked like", style: "Visual" },
        { text: "Hearing or saying their name multiple times", style: "Auditory" },
        { text: "Writing down their name or seeing it written", style: "Reading/Writing" },
        { text: "Associating them with a handshake or activity", style: "Kinesthetic" }
      ]
    },
    {
      id: 9,
      text: "In class or meetings, I prefer when:",
      options: [
        { text: "Information is presented with visuals and demonstrations", style: "Visual" },
        { text: "There are discussions and opportunities to ask questions", style: "Auditory" },
        { text: "Detailed notes or handouts are provided", style: "Reading/Writing" },
        { text: "There are practical activities or movement involved", style: "Kinesthetic" }
      ]
    },
    {
      id: 10,
      text: "When explaining something to someone else, I typically:",
      options: [
        { text: "Show pictures or draw diagrams", style: "Visual" },
        { text: "Explain verbally with emphasis on clear speech", style: "Auditory" },
        { text: "Write it down or refer to written materials", style: "Reading/Writing" },
        { text: "Demonstrate physically how to do it", style: "Kinesthetic" }
      ]
    }
  ];

  // Brief descriptions of each learning style
  const styleDescriptions = {
    Visual: "Visual learners absorb information best through images, diagrams, and spatial understanding. They benefit from charts, maps, and color-coding.",
    Auditory: "Auditory learners retain information through listening and speaking. They excel in discussions, lectures, and verbal explanations.",
    "Reading/Writing": "Reading/Writing learners prefer text-based input and output. They learn through reading articles and books, and by writing notes and summaries.",
    Kinesthetic: "Kinesthetic learners learn by doing and physically engaging with the material. They benefit from hands-on activities, experiments, and movement."
  };

  // Get icon based on learning style
  const getStyleIcon = (style) => {
    switch(style) {
      case 'Visual':
        return <VisualIcon fontSize="large" sx={{ color: '#6366F1' }} />;
      case 'Auditory':
        return <AuditoryIcon fontSize="large" sx={{ color: '#EC4899' }} />;
      case 'Reading/Writing':
        return <WritingIcon fontSize="large" sx={{ color: '#06B6D4' }} />;
      case 'Kinesthetic':
        return <KinestheticIcon fontSize="large" sx={{ color: '#F59E0B' }} />;
      default:
        return <BrainIcon fontSize="large" color="primary" />;
    }
  };

  const handleAnswerChange = (questionId, answerStyle) => {
    setAnswers({
      ...answers,
      [questionId]: answerStyle
    });
  };

  const handleNext = () => {
    if (activeStep < questions.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };

  const calculateResult = () => {
    const newScores = { ...scores };
    
    // Calculate scores for each learning style
    Object.values(answers).forEach(style => {
      newScores[style] += 1;
    });
    
    setScores(newScores);
    
    // Find the learning style with the highest score
    let highestScore = 0;
    let dominantStyle = null;
    
    Object.entries(newScores).forEach(([style, score]) => {
      if (score > highestScore) {
        highestScore = score;
        dominantStyle = style;
      }
    });
    
    setResult(dominantStyle);
    setIsCompleted(true);
    
    // Store user's learning style in Firebase
    try {
      const currentUser = getCurrentUser();
      
      if (currentUser) {
        fetch('http://localhost:5000/api/store-learning-style', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learningStyle: dominantStyle,
            learningStyleDetails: {
              Visual: newScores['Visual'],
              Auditory: newScores['Auditory'],
              Reading_Writing: newScores['Reading/Writing'],
              Kinesthetic: newScores['Kinesthetic']
            },
            email: currentUser.email,
            name: currentUser.displayName,
            uid: currentUser.uid
          }),
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Error storing learning style:', error);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setAnswers({});
    setIsCompleted(false);
    setResult(null);
    setScores({
      Visual: 0,
      Auditory: 0,
      'Reading/Writing': 0,
      Kinesthetic: 0
    });
  };

  // Calculate progress percentage
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight={700}
              sx={{ 
                mb: 1, 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(to right, #6366F1, #EC4899)' 
                  : 'linear-gradient(to right, #4F46E5, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Learning Style Assessment
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              Discover your unique learning style by answering 10 simple questions. This will help personalize your learning experience.
            </Typography>
          </Box>
        </motion.div>

        {!isCompleted ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                  }}
                >
                  {/* Stepper */}
                  <Stepper 
                    activeStep={activeStep} 
                    alternativeLabel
                    sx={{ 
                      mb: 2,
                      display: { xs: 'none', md: 'flex' }
                    }}
                  >
                    {questions.map((question, index) => (
                      <Step key={question.id} completed={answers[question.id] !== undefined}>
                        <StepLabel />
                      </Step>
                    ))}
                  </Stepper>

                  {/* Mobile Progress */}
                  <Box 
                    sx={{ 
                      mb: 2, 
                      display: { xs: 'flex', md: 'none' },
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Question {activeStep + 1} of {questions.length}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {progress}% Complete
                    </Typography>
                  </Box>

                  {/* Current Question */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {questions[activeStep].text}
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
                      <RadioGroup
                        value={answers[questions[activeStep].id] || ''}
                        onChange={(e) => handleAnswerChange(questions[activeStep].id, e.target.value)}
                      >
                        {questions[activeStep].options.map((option, index) => (
                          <Card 
                            key={index}
                            variant="outlined"
                            sx={{ 
                              mb: 1.5,
                              borderRadius: 2,
                              borderColor: answers[questions[activeStep].id] === option.style 
                                ? 'primary.main' 
                                : theme.palette.divider,
                              boxShadow: answers[questions[activeStep].id] === option.style 
                                ? '0 0 0 2px rgba(106, 92, 231, 0.25)' 
                                : 'none',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: theme.palette.mode === 'dark'
                                  ? 'rgba(106, 92, 231, 0.1)'
                                  : 'rgba(106, 92, 231, 0.05)'
                              }
                            }}
                          >
                            <FormControlLabel
                              value={option.style}
                              control={<Radio color="primary" />}
                              label={
                                <Typography sx={{ py: 0.5 }}>
                                  {option.text}
                                </Typography>
                              }
                              sx={{ 
                                width: '100%', 
                                m: 0,
                                px: 2
                              }}
                            />
                          </Card>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      startIcon={<PrevIcon />}
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      size="small"
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={activeStep === questions.length - 1 ? <CheckIcon /> : <NextIcon />}
                      onClick={handleNext}
                      disabled={!answers[questions[activeStep].id]}
                      size="small"
                    >
                      {activeStep === questions.length - 1 ? 'Complete' : 'Next'}
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {/* Results */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Result Title */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStyleIcon(result)}
                    <Typography variant="h5" fontWeight={600} sx={{ ml: 1 }}>
                      Your Learning Style: {result}
                    </Typography>
                  </Box>

                  {/* Result Card */}
                  <Card 
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(30, 41, 59, 0.4) 100%)' 
                        : 'linear-gradient(145deg, rgba(241, 245, 249, 0.7) 0%, rgba(241, 245, 249, 0.4) 100%)',
                    }}
                  >
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Box sx={{ width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, bgcolor: 'primary.main' }}>
                          {getStyleIcon(result)}
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                          {result}
                        </Typography>
                        <Typography color="text.secondary" paragraph sx={{ mb: 1 }}>
                          {styleDescriptions[result]}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Score Distribution */}
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                    Your Learning Style Distribution
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {Object.entries(scores).map(([style, score]) => {
                      const percentage = Math.round((score / questions.length) * 100);
                      return (
                        <Box key={style} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ mr: 1 }}>
                              {getStyleIcon(style)}
                            </Box>
                            <Typography variant="body1" fontWeight={style === result ? 600 : 400}>
                              {style}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                ml: 'auto', 
                                color: style === result ? 'primary.main' : 'text.secondary',
                                fontWeight: style === result ? 600 : 400
                              }}
                            >
                              {percentage}%
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: `${percentage}%`,
                                borderRadius: 4,
                                bgcolor: style === 'Visual' ? '#6366F1' : 
                                        style === 'Auditory' ? '#EC4899' : 
                                        style === 'Reading/Writing' ? '#06B6D4' : '#F59E0B',
                                transition: 'width 1s ease-in-out'
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 'auto' }}
                    size="small"
                  >
                    Retake Assessment
                  </Button>
                </Paper>
              </motion.div>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    height: '100%'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} color="primary" />
                    Learning Recommendations
                  </Typography>

                  <List sx={{ py: 0 }}>
                    {result === 'Visual' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <VisualIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Use mind maps and diagrams" 
                            secondary="Organize information visually to enhance understanding and retention" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <VisualIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Watch video tutorials" 
                            secondary="Visual demonstrations can help you grasp complex concepts more easily" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <VisualIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Use color-coding in notes" 
                            secondary="Highlight key concepts with different colors to improve recall" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Auditory' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AuditoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Record and listen to lectures" 
                            secondary="Review audio recordings to reinforce learning" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AuditoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Participate in discussions" 
                            secondary="Verbal exchanges help you process and remember information" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AuditoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Read aloud when studying" 
                            secondary="Speaking and hearing the material enhances your learning" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Reading/Writing' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WritingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Take detailed notes" 
                            secondary="Writing helps you process and organize information effectively" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WritingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Create summaries and outlines" 
                            secondary="Rewriting concepts in your own words enhances understanding" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WritingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Use textbooks and articles" 
                            secondary="Reading comprehensive text-based materials suits your learning style" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Kinesthetic' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <KinestheticIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Engage in hands-on activities" 
                            secondary="Practical applications help you understand abstract concepts" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <KinestheticIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Take frequent study breaks" 
                            secondary="Movement helps maintain focus and memory retention" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <KinestheticIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Create physical models" 
                            secondary="Building tangible representations enhances your understanding" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>

                  <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                    Course Recommendations
                  </Typography>

                  <List sx={{ py: 0 }}>
                    {result === 'Visual' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <VisualIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Data Visualization" 
                            secondary="Learn to create effective charts, graphs, and infographics" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <VisualIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Graphic Design Fundamentals" 
                            secondary="Understand visual hierarchy and design principles" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Auditory' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AuditoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Public Speaking & Debate" 
                            secondary="Enhance your verbal communication skills" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AuditoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Audio Production" 
                            secondary="Learn to create and edit professional audio content" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Reading/Writing' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WritingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Creative Writing" 
                            secondary="Develop your writing skills across different formats" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WritingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Technical Documentation" 
                            secondary="Learn to write clear, concise instructional content" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}

                    {result === 'Kinesthetic' && (
                      <>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <KinestheticIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Hands-on Engineering" 
                            secondary="Build and create with practical applications" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <KinestheticIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Laboratory Sciences" 
                            secondary="Engage in experimental and practical scientific learning" 
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {/* Information Section - only show if not completed */}
        {!isCompleted && (
          <motion.div variants={itemVariants}>
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 2, 
                p: { xs: 2, md: 2.5 }, 
                borderRadius: 4, 
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  About Learning Styles
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Understanding your learning style can help you optimize your study habits and educational experiences. 
                While everyone uses multiple modes of learning, most people have a dominant preference that helps them 
                process and retain information more effectively.
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <VisualIcon sx={{ fontSize: 32, color: '#6366F1', mb: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight={600}>Visual</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Learn through seeing and visualizing
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AuditoryIcon sx={{ fontSize: 32, color: '#EC4899', mb: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight={600}>Auditory</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Learn through listening and discussing
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WritingIcon sx={{ fontSize: 32, color: '#06B6D4', mb: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight={600}>Reading/Writing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Learn through text and note-taking
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <KinestheticIcon sx={{ fontSize: 32, color: '#F59E0B', mb: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight={600}>Kinesthetic</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Learn through doing and experiencing
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default LearningStyleAssessment; 