import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Button,
  useTheme,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  QuizOutlined as QuizOutlinedIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { getUserQuizScores } from '../services/quizService';
import { toast } from 'react-toastify';

const QuizCard = ({ quiz, theme }) => {
  const history = useHistory();
  const formattedDate = new Date(quiz.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 3px 5px rgba(0,0,0,0.2)' 
          : '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'all 0.25s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 5px 10px rgba(0,0,0,0.35)' 
            : '0 4px 8px rgba(0,0,0,0.15)',
          transform: 'translateY(-3px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.01)'
        },
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                width: 40, 
                height: 40, 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <QuizIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {quiz.quizName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <AccessTimeIcon 
                  fontSize="small" 
                  sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>
              {quiz.documentId && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBookIcon 
                    fontSize="small" 
                    sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    From document: {quiz.documentName || 'Unknown document'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
              <Tooltip title="Score percentage">
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                  <CircularProgress
                    variant="determinate"
                    value={quiz.percentage || 0}
                    size={60}
                    thickness={4}
                    sx={{
                      color: theme.palette[getScoreColor(quiz.percentage)].main,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
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
                    <Typography variant="body1" fontWeight="bold">
                      {quiz.percentage}%
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              <Chip 
                label={`${quiz.correctAnswers}/${quiz.totalQuestions}`}
                size="small"
                color={getScoreColor(quiz.percentage)}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Quizzes = () => {
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [currentUser]);

  const fetchQuizzes = async () => {
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view your quizzes');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get quizzes from local storage instead of API
      const localQuizzes = getCompletedQuizzesFromLocal();
      
      // Sort quizzes by timestamp (newest first)
      const sortedQuizzes = localQuizzes.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
      });

      setQuizzes(sortedQuizzes);

      if (sortedQuizzes.length === 0) {
        setError('No completed quizzes found. Take a quiz to get started.');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load your quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for local quiz data
  const getCompletedQuizzesFromLocal = () => {
    try {
      const quizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
      console.log('Retrieved quizzes from localStorage. Count:', quizzes.length);
      return quizzes;
    } catch (error) {
      console.error('Error retrieving quizzes from localStorage:', error);
      return [];
    }
  };

  // Function to export quiz data to a local file
  const exportQuizData = () => {
    try {
      // Get quizzes from localStorage
      const quizzes = getCompletedQuizzesFromLocal();
      
      if (quizzes.length === 0) {
        toast.info('No quiz data to export.');
        return;
      }
      
      // Create a JSON string with formatting for readability
      const dataStr = JSON.stringify(quizzes, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz_data_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Quiz data exported successfully!');
    } catch (error) {
      console.error('Error exporting quiz data:', error);
      toast.error('Failed to export quiz data.');
    }
  };

  // Function to import quiz data from a local file
  const importQuizData = (callback) => {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid quiz data format');
          }
          
          // Validate data structure
          importedData.forEach(quiz => {
            if (!quiz.quizId || !quiz.timestamp || typeof quiz.percentage !== 'number') {
              throw new Error('Invalid quiz data structure');
            }
          });
          
          // Save to localStorage
          localStorage.setItem('completedQuizzes', JSON.stringify(importedData));
          
          // Call callback function if provided (to refresh data)
          if (typeof callback === 'function') {
            callback();
          }
          
          toast.success(`Imported ${importedData.length} quizzes successfully!`);
        } catch (error) {
          console.error('Error importing quiz data:', error);
          toast.error('Failed to import quiz data: ' + error.message);
        }
      };
      
      reader.readAsText(file);
    };
    
    // Trigger file selection
    fileInput.click();
  };

  // Function to clear all quiz data
  const clearAllQuizData = () => {
    // Ask for confirmation
    if (window.confirm('Are you sure you want to clear all quiz data? This action cannot be undone.')) {
      try {
        // Remove completedQuizzes from localStorage
        localStorage.removeItem('completedQuizzes');
        
        // Update UI
        setQuizzes([]);
        setError('No completed quizzes found. Take a quiz to get started.');
        
        toast.success('All quiz data cleared successfully!');
      } catch (error) {
        console.error('Error clearing quiz data:', error);
        toast.error('Failed to clear quiz data: ' + error.message);
      }
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f7fa', 
      minHeight: '100vh',
      pt: 0,
      pb: 0,
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100%'
    }}>
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 3, 
          minHeight: 'calc(100vh - 64px)', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%'
        }}>
        
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" fontWeight={700}>
            Your Quizzes
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<QuizOutlinedIcon />}
            onClick={() => history.push('/documents')}
            sx={{ 
              borderRadius: 1,
              boxShadow: theme.shadows[2]
            }}
          >
            Take a New Quiz
          </Button>
        </Box>

        {/* Main content */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3, 
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 16px 0px',
            bgcolor: theme.palette.background.paper,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', 
            width: '100%',
            maxWidth: '100%'
          }}>
          
          {/* Header bar */}
          <Box sx={{ 
            px: 3, 
            py: 1.5, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" fontWeight={600}>
              Completed Quizzes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={exportQuizData}
                sx={{ 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  height: 32
                }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => importQuizData(fetchQuizzes)}
                sx={{ 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  height: 32
                }}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={clearAllQuizData}
                sx={{ 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  height: 32
                }}
              >
                Clear All
              </Button>
              <IconButton 
                size="small" 
                onClick={fetchQuizzes}
                sx={{ 
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.05)',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                  }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Quiz list content */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            pt: 1, 
            px: 2, 
            pb: 2,
            maxHeight: 'calc(100vh - 250px)' // Limit maximum height to fit in viewport
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            ) : quizzes.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}
              >
                <List sx={{ p: 0, width: '100%', maxWidth: '100%' }}>
                  {quizzes.map((quiz) => (
                    <motion.div key={quiz.quizId} variants={itemVariants} style={{ width: '100%', overflow: 'hidden' }}>
                      <QuizCard quiz={quiz} theme={theme} />
                    </motion.div>
                  ))}
                </List>
              </motion.div>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  py: 8
                }}
              >
                <SchoolIcon 
                  sx={{ 
                    fontSize: 70, 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    mb: 2
                  }} 
                />
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  textAlign="center"
                  sx={{ mb: 1 }}
                >
                  {error || 'No quizzes found'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  textAlign="center"
                  sx={{ mb: 3, maxWidth: 400 }}
                >
                  Take quizzes from your document processing pages to track your progress and understanding.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => history.push('/documents')}
                  startIcon={<QuizOutlinedIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Browse Documents
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Quizzes; 