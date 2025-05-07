import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Avatar,
  Button,
  Chip,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  CardHeader
} from '@mui/material';
import { 
  InsertDriveFile as FileIcon,
  PlayCircleOutline as PlayIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompleteIcon,
  Notifications as NotificationIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Description as DocumentIcon,
  School as SchoolIcon,
  QuestionAnswer as QuizIcon,
  AccessAlarm as ReminderIcon,
  MoreVert as MoreIcon,
  EmojiEvents as BadgeIcon,
  LocalFireDepartment as StreakIcon,
  VideoLibrary as VideoIcon,
  Photo as ImageIcon,
  MenuBook as BookIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ContactSupport as ContactIcon,
  Psychology as PsychologyIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  Dashboard as DashboardIcon,
  AccessTime as AccessTimeIcon,
  Bookmark as BookmarkIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  MenuBook as MenuBookIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  TrendingDown as TrendingDownIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { Link, useHistory } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { getCurrentUser, recordSessionTime, getWeeklyTimeStats, getCurrentWeekTime, getUserLearningStyle } from '../services/authService';
import { getUserFiles } from '../services/fileService';
import { getUserQuizScores } from '../services/quizService';

// Add a cardStyle function that returns proper styling based on theme mode
const getCardStyle = (theme, colorMain, colorLight) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    borderRadius: 4,
    boxShadow: theme.shadows[4],
    height: '100%',
    minHeight: 160, // Add fixed minimum height for consistency
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    background: isDark ? 
      `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)` : 
      theme.palette.background.paper,
    border: '1px solid',
    borderColor: isDark ? colorLight : theme.palette.divider,
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: theme.shadows[8],
      borderColor: isDark ? colorLight : 'transparent',
      background: isDark ? 
        `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(${colorMain}, 0.05) 100%)` : 
        `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(${colorMain}, 0.05) 100%)`
    },
    display: 'flex', // Add flex display
    flexDirection: 'column', // Stack children vertically
  };
};

// Add file upload styled component
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadBox = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDragActive ? 
    theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)' 
    : 'transparent',
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)'
  }
}));

// Function to save quiz data to localStorage
const saveCompletedQuizToLocal = (quizData) => {
  try {
    // Get existing quizzes from localStorage
    const existingQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
    
    // Add new quiz data
    existingQuizzes.push({
      ...quizData,
      timestamp: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('completedQuizzes', JSON.stringify(existingQuizzes));
    console.log('Saved quizzes to localStorage. Total count:', existingQuizzes.length);
    return true;
  } catch (error) {
    console.error('Error saving quiz to localStorage:', error);
    return false;
  }
};

// Function to get completed quizzes from localStorage
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

// Add a test quiz directly to localStorage for testing
const addTestQuiz = () => {
  const testQuiz = {
    quizId: `test_quiz_${Date.now()}`,
    quizName: `Test Quiz ${new Date().toLocaleDateString()}`,
    score: 80,
    correctAnswers: 4,
    totalQuestions: 5,
    percentage: 80,
    documentId: 'test-doc',
    timestamp: new Date().toISOString()
  };
  
  saveCompletedQuizToLocal(testQuiz);
  return testQuiz;
};

const Dashboard = () => {
  const theme = useTheme();
  const history = useHistory();
  const isDarkMode = theme.palette.mode === 'dark';
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [userStreak, setUserStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [timeStats, setTimeStats] = useState({
    totalTimeSpent: 0,
    currentWeekTime: 0,
    activityBreakdown: {},
    dailyTime: []
  });
  const [weeklyStats, setWeeklyStats] = useState({
    weeklyStats: [],
    hoursByWeek: []
  });
  const [learningStyleData, setLearningStyleData] = useState({
    primaryStyle: 'Visual',
    styles: [
      { name: 'Visual', percentage: 40 },
      { name: 'Auditory', percentage: 25 },
      { name: 'Reading/Writing', percentage: 20 },
      { name: 'Kinesthetic', percentage: 15 }
    ],
    lastUpdated: null
  });
  const [refreshingStyle, setRefreshingStyle] = useState(false);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [quizPerformance, setQuizPerformance] = useState({
    text: 'Getting Started',
    trend: 'neutral'  // can be 'up', 'down' or 'neutral'
  });
  
  // Current user - In a real app this would come from auth context or props
  const user = {
    displayName: "Seif Waleed Mahdy",
    email: "seifwaleedmahdy@gmail.com",
    photoURL: null
  };

  // Function to increment quiz count when a quiz is submitted
  const incrementQuizCount = (quizData) => {
    // Save quiz to localStorage
    if (quizData) {
      saveCompletedQuizToLocal(quizData);
      console.log('Quiz saved to localStorage:', quizData);
    } else {
      console.warn('No quiz data provided to incrementQuizCount');
    }
    
    setQuizzesCount(prevCount => {
      console.log('Incrementing quiz count from', prevCount, 'to', prevCount + 1);
      return prevCount + 1;
    });
    
    // Also update quiz performance message based on new completion
    if (quizzesCount === 0) {
      setQuizPerformance({
        text: 'Just Started',
        trend: 'up'
      });
    }
  };

  // Define fetchQuizData outside useEffect so it can be referenced from event listener
  const fetchQuizData = async () => {
    try {
      // Get quizzes from localStorage instead of API
      const localQuizzes = getCompletedQuizzesFromLocal();
      
      // Set quizzes count
      setQuizzesCount(localQuizzes.length);
      console.log('Setting quizzes count to:', localQuizzes.length);
      
      // Calculate quiz performance metrics and trend message
      if (localQuizzes.length === 0) {
        setQuizPerformance({
          text: 'Getting Started',
          trend: 'neutral'
        });
      } else {
        // Sort quizzes by date (newest first)
        const sortedQuizzes = [...localQuizzes].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Get average score of recent quizzes (up to 3)
        const recentQuizzes = sortedQuizzes.slice(0, 3);
        const recentAvg = recentQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / recentQuizzes.length;
        
        // If we have more than 3 quizzes, compare with previous quizzes
        if (sortedQuizzes.length > 3) {
          const previousQuizzes = sortedQuizzes.slice(3, 6);
          const previousAvg = previousQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / previousQuizzes.length;
          
          const diff = recentAvg - previousAvg;
          
          if (diff > 5) {
            setQuizPerformance({
              text: 'Improving',
              trend: 'up'
            });
          } else if (diff < -5) {
            setQuizPerformance({
              text: 'Room for Improvement',
              trend: 'down'
            });
          } else {
            setQuizPerformance({
              text: 'Consistent Performance',
              trend: 'neutral'
            });
          }
        } else {
          // Not enough quizzes for trend analysis
          if (recentAvg >= 80) {
            setQuizPerformance({
              text: 'Excellent Start',
              trend: 'up'
            });
          } else if (recentAvg >= 60) {
            setQuizPerformance({
              text: 'Good Progress',
              trend: 'neutral'
            });
          } else {
            setQuizPerformance({
              text: 'Keep Practicing',
              trend: 'neutral'
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      // Keep default values on error
    }
  };

  // Subscribe to quiz submission events
  useEffect(() => {
    // Create a custom event listener to detect quiz submissions
    const handleQuizSubmitted = (event) => {
      // Extract quiz details from the event
      const quizData = event.detail;
      console.log('Quiz submission event received in Dashboard:', quizData);
      incrementQuizCount(quizData);
      // Refresh quiz data to get updated stats
      fetchQuizData();
    };

    // Add event listener for quiz submissions
    window.addEventListener('quizSubmitted', handleQuizSubmitted);
    console.log('Quiz submission event listener attached');
    
    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener('quizSubmitted', handleQuizSubmitted);
      console.log('Quiz submission event listener removed');
    };
  }, [quizzesCount]); // Dependency on quizzesCount to update properly

  // Fetch user quizzes count and performance
  useEffect(() => {
    console.log('Dashboard component mounted, fetching quiz data...');
    fetchQuizData();
    
    // DEBUG: Add this line to test localStorage directly
    // Uncomment this line to manually add a test quiz for debugging
    // setTimeout(() => {
    //   const testQuiz = addTestQuiz();
    //   console.log('Added test quiz:', testQuiz);
    //   fetchQuizData(); // Refresh data
    // }, 2000);
  }, []);

  // Add a helper function to manually trigger the quiz submitted event (for debugging)
  const triggerTestQuiz = () => {
    const testQuiz = addTestQuiz();
    console.log('Added test quiz directly:', testQuiz);
    
    // Dispatch event manually
    const event = new CustomEvent('quizSubmitted', { detail: testQuiz });
    window.dispatchEvent(event);
    console.log('Manually dispatched quiz event');
    
    // Refresh data after a short delay
    setTimeout(fetchQuizData, 500);
  };

  // Add click handler to quizzes card for easy testing
  const handleQuizzesCardClick = () => {
    // Always navigate to quizzes page, don't add test quizzes
    history.push('/quizzes');
  };

  // Function to export quiz data to a local file
  const exportQuizData = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
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

  // Function to clear all quiz data
  const clearQuizData = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // Ask for confirmation
    if (window.confirm('Are you sure you want to clear all quiz data? This action cannot be undone.')) {
      try {
        // Remove quizzes from localStorage
        localStorage.removeItem('completedQuizzes');
        
        // Update UI by setting quizzes count to 0
        setQuizzesCount(0);
        setQuizPerformance({
          text: 'Getting Started',
          trend: 'neutral'
        });
        
        toast.success('All quiz data cleared successfully!');
      } catch (error) {
        console.error('Error clearing quiz data:', error);
        toast.error('Failed to clear quiz data: ' + error.message);
      }
    }
  };

  // Function to import quiz data from a local file
  const importQuizData = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
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
          
          // Refresh quiz data display
          fetchQuizData();
          
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

  // Get time-based greeting
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      let greet = '';
      
      if (hour < 12) greet = 'Good Morning';
      else if (hour < 18) greet = 'Good Afternoon';
      else greet = 'Good Evening';
      
      setGreeting(greet);
    };

    // List of motivational quotes
    const quotes = [
      "Ready to achieve more today?",
      "Let's make progress together!",
      "Every day is a chance to learn something new.",
      "Keep pushing your limits!",
      "Small steps lead to big achievements."
    ];
    
    // Set random quote
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    getGreeting();
    // Update greeting if user keeps the app open across time changes
    const interval = setInterval(getGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch learning style data
  const fetchLearningStyleData = async () => {
    try {
      setRefreshingStyle(true);
      
      // Fetch the actual learning style data from the backend
      const result = await getUserLearningStyle();
      
      if (result.success) {
        setLearningStyleData({
          primaryStyle: result.primaryStyle,
          styles: result.styles,
          lastUpdated: result.lastUpdated
        });
      } else {
        console.error('Error fetching learning style:', result.error);
        // Keep the default mock data if there's an error
      }
    } catch (error) {
      console.error('Error fetching learning style data:', error);
      // Keep the default mock data if there's an error
    } finally {
      setRefreshingStyle(false);
    }
  };

  useEffect(() => {
    fetchLearningStyleData();
  }, []);

  // Fetch user streak data
  useEffect(() => {
    const fetchUserStreak = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.email) return;
        
        const response = await fetch('http://localhost:5000/api/user/login-streak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: currentUser.email }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching streak: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.streak) setUserStreak(data.streak);
        if (data.longestStreak) setLongestStreak(data.longestStreak);
      } catch (error) {
        console.error("Error fetching login streak:", error);
        // Don't show error to user, just use default values
      }
    };
    
    fetchUserStreak();
  }, []);

  // Fetch user time stats
  useEffect(() => {
    const fetchTimeStats = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.email) return;
        
        const response = await fetch('http://localhost:5000/api/user/time-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: currentUser.email }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching time stats: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Also fetch current week time
        const weekTimeData = await getCurrentWeekTime();
        
        setTimeStats({
          totalTimeSpent: data.totalTimeSpent || 0,
          currentWeekTime: weekTimeData.success ? weekTimeData.currentWeekTime : 0,
          activityBreakdown: data.activityBreakdown || {},
          dailyTime: data.dailyTime || []
        });
      } catch (error) {
        console.error("Error fetching time stats:", error);
        // Use default values
      }
    };
    
    fetchTimeStats();
    
    // Set up interval to record session time periodically (every 5 minutes)
    const recordInterval = setInterval(() => {
      const user = getCurrentUser();
      if (user) {
        recordSessionTime().catch(error => {
          console.error("Error recording periodic session time:", error);
        });
      }
    }, 5 * 60 * 1000);
    
    // Clean up interval
    return () => {
      clearInterval(recordInterval);
      // Record final session time when component unmounts
      recordSessionTime().catch(error => {
        console.error("Error recording final session time:", error);
      });
    };
  }, []);

  // Fetch user weekly time stats
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.email) return;
        
        const data = await getWeeklyTimeStats();
        if (data && data.success) {
          setWeeklyStats({
            weeklyStats: data.weeklyStats || [],
            hoursByWeek: data.hoursByWeek || []
          });
        }
      } catch (error) {
        console.error("Error fetching weekly time stats:", error);
        // Use default values
      }
    };
    
    fetchWeeklyStats();
    
    // Set up interval to record session time periodically (every 5 minutes)
    const recordInterval = setInterval(() => {
      const user = getCurrentUser();
      if (user) {
        recordSessionTime().catch(error => {
          console.error("Error recording periodic session time:", error);
        });
      }
    }, 5 * 60 * 1000);
    
    // Clean up interval
    return () => {
      clearInterval(recordInterval);
      // Record final session time when component unmounts
      recordSessionTime().catch(error => {
        console.error("Error recording final session time:", error);
      });
    };
  }, []);

  // Fetch user documents count
  useEffect(() => {
    const fetchDocumentsCount = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.uid) return;
        
        const userFiles = await getUserFiles(currentUser.uid);
        
        if (Array.isArray(userFiles)) {
          setDocumentsCount(userFiles.length);
        }
      } catch (error) {
        console.error("Error fetching documents count:", error);
        // Keep default value on error
      }
    };
    
    fetchDocumentsCount();
  }, []);

  // Format minutes as readable time
  const formatTimeSpent = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  // Format week string for display
  const formatWeekLabel = (weekId) => {
    if (!weekId) return '';
    // Extract week number from format "YYYY-WNN"
    const match = weekId.match(/W(\d+)$/);
    return match ? `Week ${match[1]}` : weekId;
  };

  // Get current week ID
  const getCurrentWeekId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const date = new Date(now.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (date.getDay() || 7) + 1); // Start of current week
    const weekNum = Math.ceil((((date - new Date(year, 0, 1)) / 86400000) + 1) / 7);
    return `${year}-W${weekNum.toString().padStart(2, '0')}`;
  };

  // Get this week's hours
  const getThisWeekHours = () => {
    const currentWeekId = getCurrentWeekId();
    const currentWeek = weeklyStats.weeklyStats.find(week => week.weekId === currentWeekId);
    return currentWeek ? currentWeek.hours : 0;
  };

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
      transition: { duration: 0.4 }
    }
  };

  // Card hover animation
  const cardHoverVariants = {
    hover: { 
      y: -8,
      boxShadow: theme.shadows[8],
      transition: { duration: 0.3 }
    }
  };

  // Mock data for charts and progress
  const learningProgress = [
    { subject: 'Machine Learning', progress: 75 },
    { subject: 'Data Structures', progress: 60 },
    { subject: 'Web Development', progress: 90 },
    { subject: 'UI/UX Design', progress: 45 }
  ];

  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.uid) return;
        
        const userFiles = await getUserFiles(currentUser.uid);
        
        if (Array.isArray(userFiles)) {
          // Sort by date (newest first)
          const sortedDocs = userFiles.sort((a, b) => {
            // Handle missing dates
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          });
          
          // Take only the first 3 documents
          const recentDocs = sortedDocs.slice(0, 3).map(doc => {
            // Calculate relative time (e.g., "2 hours ago")
            let relativeTime = '1 day ago';
            if (doc.createdAt) {
              const docDate = new Date(doc.createdAt);
              const now = new Date();
              const diffMs = now - docDate;
              const diffMins = Math.floor(diffMs / (1000 * 60));
              
              if (diffMins < 60) {
                relativeTime = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
              } else if (diffMins < 1440) {
                const diffHours = Math.floor(diffMins / 60);
                relativeTime = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
              } else {
                const diffDays = Math.floor(diffMins / 1440);
                relativeTime = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
              }
            }
            
            return {
              id: doc.id,
              title: doc.name || `Document ${doc.id}`,
              date: relativeTime,
              type: doc.type ? doc.type.split('/')[1]?.toUpperCase() || 'DOC' : 'DOC',
              learningStyle: doc.learningStyle
            };
          });
          
          setRecentDocuments(recentDocs);
        }
      } catch (error) {
        console.error("Error fetching recent documents:", error);
      }
    };
    
    fetchRecentDocuments();
  }, []);

  const upcomingQuizzes = [
    { id: 1, title: 'Neural Networks Quiz', date: 'Tomorrow', completed: false },
    { id: 2, title: 'React Components', date: 'In 3 days', completed: false }
  ];

  const notifications = [
    { id: 1, title: 'New quiz available', message: 'Neural Networks Quiz is ready to take', time: '1 hour ago' },
    { id: 2, title: 'Document processed', message: 'Your PDF has been analyzed', time: '3 hours ago' },
    { id: 3, title: 'Learning milestone reached', message: 'You completed 10 quizzes!', time: 'Yesterday' }
  ];

  const earnedBadges = [
    { id: 1, name: 'Quiz Master', description: 'Completed 10 quizzes with over 80% score', icon: <QuizIcon /> },
    { id: 2, name: `${userStreak}-Day Streak`, description: `Logged in for ${userStreak} days in a row`, icon: <StreakIcon /> }
  ];

  // Learning style tips
  const learningStyleTips = {
    Visual: 'Try videos, infographics, and concept maps for better retention.',
    Auditory: 'Use audio materials, discussions, and verbal repetition for learning.',
    Reading: 'Learn through textbooks, articles, and note-taking.',
    Kinesthetic: 'Practice hands-on activities and real-world applications.'
  };

  // Learning style descriptions for tooltips
  const learningStyleDescriptions = {
    Visual: 'You learn best through visual elements: images, diagrams, and videos.',
    Auditory: 'You prefer learning through listening: lectures, discussions, and audio materials.',
    Reading: 'You absorb information effectively through reading and writing.',
    Kinesthetic: 'You learn best through physical activities and hands-on experiences.'
  };

  // Handle notification menu
  const handleOpenNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  // Handle profile menu
  const handleOpenProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  // Handle navigation from profile menu
  const handleProfileAction = (action) => {
    handleCloseProfileMenu();
    switch(action) {
      case 'profile':
        history.push('/profile');
        break;
      case 'settings':
        history.push('/settings');
        break;
      case 'contact':
        history.push('/contact');
        break;
      case 'logout':
        try {
          // Call logout service and use window.location.href to force complete page reload
          console.log('Logging out...');
          import('../services/authService').then(({ logoutUser }) => {
            logoutUser().then(() => {
              window.location.href = '/';
            }).catch(err => {
              console.error('Error during logout:', err);
            });
          });
        } catch (error) {
          console.error('Error initiating logout:', error);
        }
        break;
      default:
        break;
    }
  };

  // Chart options and data
  const areaChartOptions = {
    chart: {
      id: 'learning-progress',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      fontFamily: 'Poppins, sans-serif',
      foreColor: theme.palette.text.secondary
    },
    colors: ['#6C5CE7', '#FF5E84'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: false
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: 'Poppins, sans-serif'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: 'Poppins, sans-serif'
        },
        formatter: function(value) {
          return value + '%';
        }
      },
      title: {
        text: 'Progress (%)',
        style: {
          color: theme.palette.text.primary,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600
        }
      },
      min: 0,
      max: 100,
      tickAmount: 5
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: {
        show: true,
        formatter: function(val, opts) {
          return 'Week ' + val;
        }
      },
      y: {
        title: {
          formatter: function(seriesName) {
            return seriesName + ': ';
          }
        },
        formatter: function(value) {
          return value + '%';
        }
      },
      marker: {
        show: true
      },
      shared: true,
      intersect: false,
      followCursor: true
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      fontSize: '14px',
      fontFamily: 'Poppins, sans-serif',
      labels: {
        colors: theme.palette.text.primary
      }
    },
    annotations: {
      points: [{
        x: 'Week 7',
        y: 70,
        marker: {
          size: 6,
          fillColor: '#6C5CE7',
          strokeColor: '#fff',
          strokeWidth: 2,
          radius: 2
        },
        label: {
          text: 'Current',
          borderColor: '#6C5CE7',
          style: {
            color: theme.palette.getContrastText('#6C5CE7'),
            background: '#6C5CE7'
          }
        }
      }]
    }
  };

  const areaChartSeries = [
    {
      name: 'Learning Progress',
      data: [30, 40, 25, 50, 49, 60, 70]
    },
    {
      name: 'Quiz Scores',
      data: [20, 35, 40, 45, 55, 40, 65]
    }
  ];

  const pieChartOptions = {
    chart: {
      fontFamily: 'Poppins, sans-serif',
      foreColor: theme.palette.text.secondary,
      toolbar: {
        show: false
      }
    },
    labels: learningStyleData.styles.map(style => style.name),
    colors: ['#6C5CE7', '#FF5E84', '#38B2AC', '#F6AD55'],
    legend: {
      position: 'bottom',
      fontFamily: 'Poppins, sans-serif',
      labels: {
        colors: theme.palette.text.primary
      },
      formatter: function(seriesName, opts) {
        return [seriesName, ' - ', opts.w.globals.series[opts.seriesIndex] + '%']
      },
      itemMargin: {
        horizontal: 12,
        vertical: 5
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        return opts.w.globals.series[opts.seriesIndex] + '%';
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 'bold',
        colors: [theme.palette.getContrastText('#6C5CE7'), 
                theme.palette.getContrastText('#FF5E84'), 
                theme.palette.getContrastText('#38B2AC'), 
                theme.palette.getContrastText('#F6AD55')]
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.5
      }
    },
    tooltip: {
      enabled: true,
      theme: isDarkMode ? 'dark' : 'light',
      fillSeriesColor: false,
      style: {
        fontSize: '14px',
        fontFamily: 'Poppins, sans-serif'
      },
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        const label = w.config.labels[seriesIndex];
        const value = series[seriesIndex];
        const description = learningStyleDescriptions[label];
        
        return `<div class="apexcharts-tooltip-title" style="font-weight: bold; margin-bottom: 5px; font-family: Poppins, sans-serif;">
                  ${label} Learner - ${value}%
                </div>
                <div class="apexcharts-tooltip-series-group" style="padding: 5px; font-family: Poppins, sans-serif;">
                  ${description}
                </div>`;
      }
    },
    stroke: {
      width: 2,
      colors: [theme.palette.background.paper]
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: function(val) {
                return val + '%';
              }
            }
          }
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const pieChartSeries = learningStyleData.styles.map(style => style.percentage);

  // Map color values for each card (RGB format for easier opacity adjustments)
  const cardColors = {
    documents: { main: '106, 92, 231', light: 'primary.light' }, // purple
    time: { main: '245, 101, 101', light: 'error.light' }, // red
    quizzes: { main: '56, 178, 172', light: 'success.light' }, // green
    progress: { main: '246, 173, 85', light: 'warning.light' }, // orange
    sessions: { main: '75, 123, 236', light: 'info.light' } // blue
  };

  // Add new state for file upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLearningStyle, setSelectedLearningStyle] = useState('visual');
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };
  
  // Learning style change handler
  const handleLearningStyleChange = (event) => {
    setSelectedLearningStyle(event.target.value);
  };
  
  // Drag and drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      setUploadError(null);
    }
  };
  
  // File upload handler
  const handleFileUpload = (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    // Simulate file upload with progress
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setShowUploadModal(false);
            setSelectedFile(null);
            toast.success('File uploaded successfully!');
          }, 500);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 300);
  };

  // Format learning style timestamp
  const formatLearningStyleDate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      // Handle Firestore timestamp
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      
      // Handle string timestamp
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown date';
    }
  };

  // Get color for a particular learning style
  const getLearningStyleColor = (styleName) => {
    switch(styleName) {
      case 'Visual':
        return '#6C5CE7'; // purple
      case 'Auditory':
        return '#FF5E84'; // pink/red
      case 'Reading':
      case 'Reading/Writing':
        return '#38B2AC'; // teal
      case 'Kinesthetic':
        return '#F6AD55'; // orange
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 0,
        m: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
        pl: { xs: 2, sm: 3 } // Add padding only on the left side for spacing from sidebar
      }}
    >
      {/* Top section with header and notification icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            p: 3,
            pl: 2, // Reduced left padding to align more to the left
            pr: 3,
            mb: 2
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ textAlign: 'left' }}>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, textAlign: 'left' }}>
              {greeting}, {user.displayName.split(' ')[0]}! {motivationalQuote}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, md: 0 } }}>
            {/* Notifications */}
            <Tooltip title="View notifications">
              <Badge badgeContent={3} color="error">
                <IconButton 
                  onClick={handleOpenNotifications}
                  sx={{ 
                    color: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                  }}
                >
                  <NotificationIcon color="inherit" />
                </IconButton>
              </Badge>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleCloseProfileMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>{user.displayName}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => handleProfileAction('profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('contact')}>
          <ListItemIcon>
            <ContactIcon fontSize="small" />
          </ListItemIcon>
          Contact Us
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleProfileAction('logout')}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleCloseNotifications}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 320,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
          <Chip label="3 new" size="small" color="error" />
        </Box>
        <Divider />
        
        {/* Categorized notifications */}
        {notifications.map((notification) => {
          // Determine the icon based on notification type
          let icon;
          let color;
          if (notification.title.includes('quiz')) {
            icon = <QuizIcon fontSize="small" />;
            color = 'primary.main';
          } else if (notification.title.includes('Document')) {
            icon = <DocumentIcon fontSize="small" />;
            color = 'info.main';
          } else if (notification.title.includes('milestone')) {
            icon = <BadgeIcon fontSize="small" />;
            color = 'success.main';
          } else {
            icon = <NotificationIcon fontSize="small" />;
            color = 'warning.main';
          }

          return (
            <MenuItem key={notification.id} onClick={handleCloseNotifications}>
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: color, width: 32, height: 32, mr: 1.5 }}>
                  {icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="subtitle2">{notification.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        })}
        
        <Divider />
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography color="primary" variant="body2">View all notifications</Typography>
        </MenuItem>
      </Menu>

      <Grid container spacing={3} sx={{ px: 2 }}>
        {/* Document Processing Tab - New Section */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: '1px solid',
                borderColor: theme.palette.divider,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Quick Actions
                </Typography>
              </Box>

              {/* Quick Action Panel */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Card
                      onClick={() => history.push('/documents')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[3],
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <DocumentIcon color="info" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" fontWeight={500}>
                        View Documents
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card
                      onClick={() => history.push('/learning-style')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[3],
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <PsychologyIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" fontWeight={500}>
                        Learning Style Test
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card
                      onClick={() => history.push('/progress')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[3],
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <TrendingUpIcon color="warning" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" fontWeight={500}>
                        View Progress
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                style={{ height: '100%' }} // Add height to wrapper
              >
                <Card 
                  className="dashboard-card"
                  sx={getCardStyle(theme, cardColors.documents.main, cardColors.documents.light)}
                  onClick={() => history.push('/documents')}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: isDarkMode ? `rgba(${cardColors.documents.main}, 0.2)` : `rgba(${cardColors.documents.main}, 0.1)`, 
                          color: 'primary.main',
                          width: 48,
                          height: 48,
                          boxShadow: isDarkMode ? `0 0 10px rgba(${cardColors.documents.main}, 0.3)` : 'none'
                        }}
                      >
                        <DocumentIcon />
                      </Avatar>
                      <TrendingUpIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h5" component="div" fontWeight={700}>
                        {documentsCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Documents Processed
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                style={{ height: '100%' }} // Add height to wrapper
              >
                <Card 
                  className="dashboard-card"
                  sx={getCardStyle(theme, cardColors.time.main, cardColors.time.light)}
                  onClick={() => history.push('/progress')}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: isDarkMode ? `rgba(${cardColors.time.main}, 0.2)` : `rgba(${cardColors.time.main}, 0.1)`, 
                          color: 'error.main',
                          width: 48,
                          height: 48,
                          boxShadow: isDarkMode ? `0 0 10px rgba(${cardColors.time.main}, 0.3)` : 'none'
                        }}
                      >
                        <TimeIcon />
                      </Avatar>
                      <TrendingUpIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h5" component="div" fontWeight={700}>
                        {formatTimeSpent(timeStats.totalTimeSpent)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Learning Time
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`${formatTimeSpent(timeStats.currentWeekTime)} this week`} 
                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                style={{ height: '100%' }} // Add height to wrapper
              >
                <Card 
                  className="dashboard-card"
                  sx={getCardStyle(theme, cardColors.quizzes.main, cardColors.quizzes.light)}
                  onClick={handleQuizzesCardClick}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: isDarkMode ? `rgba(${cardColors.quizzes.main}, 0.2)` : `rgba(${cardColors.quizzes.main}, 0.1)`, 
                          color: 'success.main',
                          width: 48,
                          height: 48,
                          boxShadow: isDarkMode ? `0 0 10px rgba(${cardColors.quizzes.main}, 0.3)` : 'none'
                        }}
                      >
                        <QuizIcon />
                      </Avatar>
                      <TrendingUpIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h5" component="div" fontWeight={700}>
                        {quizzesCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Quizzes Completed
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                style={{ height: '100%' }} // Add height to wrapper
              >
                <Card 
                  className="dashboard-card"
                  sx={getCardStyle(theme, cardColors.progress.main, cardColors.progress.light)}
                  onClick={() => history.push('/progress')}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: isDarkMode ? `rgba(${cardColors.progress.main}, 0.2)` : `rgba(${cardColors.progress.main}, 0.1)`, 
                          color: 'warning.main',
                          width: 48,
                          height: 48,
                          boxShadow: isDarkMode ? `0 0 10px rgba(${cardColors.progress.main}, 0.3)` : 'none'
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <TrendingUpIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h5" component="div" fontWeight={700}>
                        {quizPerformance.text}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Overall Progress
                        {quizPerformance.trend === 'up' && (
                          <TrendingUpIcon color="success" fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                        {quizPerformance.trend === 'down' && (
                          <TrendingDownIcon color="error" fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid item xs={12} md={8}>
          {/* Recent Documents */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Documents
                    </Typography>
                    <Button size="small" onClick={() => history.push('/documents')}>
                      View All
                    </Button>
                  </Box>
                  <List>
                    {recentDocuments.map((doc) => (
                      <React.Fragment key={doc.id}>
                        <ListItem 
                          disablePadding 
                          sx={{ 
                            py: 1.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: theme.palette.action.hover,
                              borderRadius: 1
                            },
                            cursor: 'pointer'
                          }}
                          onClick={() => history.push(`/process/${doc.id}`, {
                            documentName: doc.title,
                            learningStyle: doc.learningStyle
                          })}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              size="small"
                              sx={{ 
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the ListItem click from triggering
                                history.push(`/process/${doc.id}`, {
                                  documentName: doc.title,
                                  learningStyle: doc.learningStyle
                                });
                              }}
                            >
                              <PlayIcon color="primary" />
                            </IconButton>
                          }
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar 
                              variant="rounded"
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: 'rgba(106, 92, 231, 0.1)',
                                color: 'primary.main',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {doc.type}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary={doc.title}
                            secondary={doc.date}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                        {doc.id !== recentDocuments.length && (
                          <Divider component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>

        {/* Learning Style Analysis */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Learning Style Analysis"
              action={
                <IconButton onClick={fetchLearningStyleData}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              {learningStyleData.lastUpdated ? (
                <Box sx={{ position: 'relative' }}>
                  <Chart
                    options={pieChartOptions}
                    series={pieChartSeries}
                    type="pie"
                    height={280}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your dominant learning style is{' '}
                      <Typography
                        component="span"
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold', color: getLearningStyleColor(learningStyleData.primaryStyle) }}
                      >
                        {learningStyleData.primaryStyle}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {learningStyleTips[learningStyleData.primaryStyle]}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  <PsychologyIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.7 }} />
                  <Typography variant="h6">Complete Your Learning Style Assessment</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Discover your learning style preferences to optimize your learning experience. This will also unlock document uploads.
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/learning-style"
                    startIcon={<PsychologyIcon />}
                    sx={{
                      bgcolor: '#5e6edc',
                      '&:hover': { bgcolor: '#4a5dc7' },
                      borderRadius: 1
                    }}
                  >
                    Take Assessment Now
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Progress */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Subject Progress
              </Typography>
              <Box sx={{ mt: 3 }}>
                {learningProgress.map((subject, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {subject.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={subject.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(106, 92, 231, 0.1)'
                      }} 
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/progress"
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                  }}
                >
                  View Detailed Progress
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Gamification Card */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Your Achievements
                </Typography>
                <Chip 
                  icon={<StreakIcon color="warning" />}
                  label={`${userStreak}-Day Streak`} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', my: 2 }}>
                {earnedBadges.map((badge) => (
                  <Tooltip key={badge.id} title={badge.description}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: 100, 
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          mb: 1,
                          width: 40,
                          height: 40
                        }}
                      >
                        {badge.icon}
                      </Avatar>
                      <Typography variant="caption" align="center" fontWeight={500}>
                        {badge.name}
                      </Typography>
                    </Paper>
                  </Tooltip>
                ))}
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button 
                  startIcon={<BadgeIcon />}
                  variant="text"
                  size="small"
                >
                  View All Badges
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Upload Document Modal */}
      <Dialog 
        open={showUploadModal} 
        onClose={() => !uploading && setShowUploadModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Document
          <IconButton
            aria-label="close"
            onClick={() => !uploading && setShowUploadModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            disabled={uploading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 2 }}>
            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>
            )}
            
            <UploadBox
              isDragActive={isDragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                {selectedFile ? selectedFile.name : 'Drag and drop a file here or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supports PDF, DOC, DOCX, TXT, PPT, PPTX files up to 10MB
              </Typography>
              
              <Button
                component="label"
                variant="contained"
                tabIndex={-1}
                disabled={uploading}
              >
                Browse Files
                <VisuallyHiddenInput 
                  type="file" 
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                />
              </Button>
            </UploadBox>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="learning-style-label">Learning Style</InputLabel>
              <Select
                labelId="learning-style-label"
                id="learning-style"
                value={selectedLearningStyle}
                label="Learning Style"
                onChange={handleLearningStyleChange}
                disabled={uploading}
              >
                <MenuItem value="visual">Visual</MenuItem>
                <MenuItem value="auditory">Auditory</MenuItem>
                <MenuItem value="reading">Reading/Writing</MenuItem>
                <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
              </Select>
            </FormControl>
            
            {uploading && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => !uploading && setShowUploadModal(false)} 
                disabled={uploading}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;