import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/styles.css";
import styled from 'styled-components';
import { FiDownload, FiFile, FiBook, FiTrash2 } from 'react-icons/fi';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  useTheme,
  Stack,
  Divider
} from '@mui/material';
import { 
  School, 
  Psychology,
  Assessment,
  QuestionAnswer,
  People,
  Dashboard as DashboardIcon,
  KeyboardArrowDown
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';

const StyledContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1000px;
`;

const Title = styled(motion.h1)`
  color: #4A4A4A;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    color: #7C4DFF;
  }
`;

const FilesList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const FileItem = styled(motion.li)`
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FileName = styled.div`
  font-size: 1.1rem;
  color: #4A4A4A;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #7C4DFF;
  }
`;

const DownloadButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #00C853;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 200, 83, 0.2);

  &:hover {
    background: #00B84D;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 200, 83, 0.3);
  }
`;

const AuthSection = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const AuthMessage = styled(motion.p)`
  font-size: 1.2rem;
  color: #666;
  max-width: 500px;
  line-height: 1.6;
  text-align: center;
`;

const AuthButton = styled(motion.button)`
  padding: 1rem 2rem;
  background: #7C4DFF;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(124, 77, 255, 0.2);

  &:hover {
    background: #6B3FFF;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(124, 77, 255, 0.3);
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const RenameInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: #7C4DFF;
  }
`;

const FileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DeleteButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(220, 53, 69, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const FolderInfo = styled(motion.div)`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;

  svg {
    color: #7C4DFF;
  }
`;

const SignOutButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(220, 53, 69, 0.3);
  }
`;

// New styled component for sticky header
const StickyHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.scrolled ? 
    'rgba(255, 255, 255, 0.9)' : 
    'transparent'};
  backdrop-filter: ${props => props.scrolled ? 'blur(10px)' : 'none'};
  box-shadow: ${props => props.scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'};
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.3s ease;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.scrolled ? '#333' : 'white'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.scrolled ? '#7C4DFF' : '#ddd'};
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

function Home() {
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRenaming, setIsRenaming] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch files whenever user status changes
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auth status check function
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drive/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.isAuthenticated && data.user) {
        setUser(data.user);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      toast.error("Error checking authentication status");
    }
  };

  const handleAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drive/auth/url', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.url) {
        toast.info("You'll be redirected to sign in with your Google account.");
        
        // Open the auth URL in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const authWindow = window.open(
          data.url,
          'Google Sign In',
          `width=${width},height=${height},left=${left},top=${top},menubar=0,toolbar=0,location=0`
        );

        // Listen for the authentication result
        const handleMessage = async (event) => {
          if (event.data === 'authentication_successful') {
            window.removeEventListener('message', handleMessage);
            if (authWindow) {
              authWindow.close();
            }
            toast.success("Successfully connected to Google Drive!");
            await checkAuthStatus();
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      toast.error("Error initiating authentication");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('http://localhost:5000/api/drive/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setFiles([]);
      toast.success("Successfully signed out");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out");
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drive/files', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        // Compare with current files to avoid unnecessary updates
        if (JSON.stringify(data.files) !== JSON.stringify(files)) {
          setFiles(data.files);
        }
      } else {
        toast.error("Error fetching files");
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error("Error connecting to server");
    }
  };

  const handleNameChange = (fileId, newName) => {
    setIsRenaming(prev => ({
      ...prev,
      [fileId]: newName
    }));
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      // Get the custom filename if it exists
      const customName = isRenaming[fileId];
      const queryParams = customName ? `?filename=${encodeURIComponent(customName)}` : '';
      
      const response = await fetch(`http://localhost:5000/api/drive/download/${fileId}${queryParams}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'download';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        const blob = await response.blob();
        
        try {
          // Create a handle to save the file
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'All Files',
              accept: {
                'application/*': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx', '.csv']
              }
            }],
          });
          
          // Create a FileSystemWritableFileStream to write to
          const writable = await handle.createWritable();
          
          // Write the contents of the file
          await writable.write(blob);
          
          // Close the file and write the contents to disk
          await writable.close();
          
          toast.success("File downloaded successfully!");
        } catch (err) {
          // If user cancels the save dialog or if the API is not supported
          if (err.name !== 'AbortError') {
            // Fall back to the old method
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("File downloaded successfully!");
          }
        }
      } else {
        const errorData = await response.json();
        toast.error("Download failed: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Error downloading file");
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/drive/delete/${fileId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
          toast.success("File deleted successfully!");
          // Remove the file from local state immediately
          setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
          // Then refresh the list from server
          fetchFiles();
        } else {
          if (data.error.includes('File not found') || data.error.includes('not accessible')) {
            toast.info("This file no longer exists in Google Drive. Refreshing list...");
            // Remove the file from local state
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
            // Refresh the list
            fetchFiles();
          } else {
            toast.error("Delete failed: " + data.error);
          }
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error("Error deleting file");
      }
    }
  };

  // Enhanced animation variants
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

  // Pulse animation for CTA button
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 4px 10px rgba(124, 77, 255, 0.2)',
      '0 4px 20px rgba(124, 77, 255, 0.4)',
      '0 4px 10px rgba(124, 77, 255, 0.2)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse'
    }
  };

  // Card hover animation
  const cardHoverAnimation = {
    hover: { 
      scale: 1.03, 
      boxShadow: '0px 10px 30px rgba(124, 77, 255, 0.2)',
      borderColor: '#7c4dff',
      transition: { duration: 0.3 }
    }
  };

  // Scroll down indicator animation
  const scrollIndicatorAnimation = {
    y: [0, 10, 0],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse'
    }
  };

  // Feature cards data
  const features = [
    {
      icon: <Psychology fontSize="large" color="primary" />,
      title: "AI-Powered Learning",
      description: "Adaptive AI tailors learning materials to your unique style and pace."
    },
    {
      icon: <QuestionAnswer fontSize="large" color="primary" />,
      title: "Intelligent Quizzes",
      description: "Test your knowledge with adaptive quizzes that focus on your weak areas."
    },
    {
      icon: <Assessment fontSize="large" color="primary" />,
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed analytics and insights."
    },
    {
      icon: <People fontSize="large" color="primary" />,
      title: "Collaborative Learning",
      description: "Connect with peers and mentors to enhance your understanding and engagement."
    }
  ];

  return (
    <Box>
      {/* Sticky Header */}
      <StickyHeader scrolled={scrolled}>
        <NavContainer maxWidth="lg">
          <Logo to="/" scrolled={scrolled}>
            <img 
              src="/Logo.png" 
              alt="LearnLink Logo" 
              style={{ 
                height: '40px', 
                width: 'auto',
                filter: scrolled ? 'none' : 'brightness(1.5)' // Make logo brighter on transparent background
              }} 
            />
          </Logo>
          <NavLinks>
            <NavLink to="/#features" scrolled={scrolled}>Features</NavLink>
            <NavLink to="/how-it-works" scrolled={scrolled}>How It Works</NavLink>
            <NavLink to="/pricing" scrolled={scrolled}>Pricing</NavLink>
            {currentUser ? (
              <NavLink to="/dashboard" scrolled={scrolled}>Dashboard</NavLink>
            ) : (
              <NavLink to="/login" scrolled={scrolled}>Login</NavLink>
            )}
          </NavLinks>
        </NavContainer>
      </StickyHeader>

      {/* Hero Section with Particle Background */}
      <Box 
        sx={{
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)' 
            : 'linear-gradient(135deg, #7c4dff 0%, #5c6bc0 100%)',
          pt: { xs: 12, md: 16 }, // Increased padding to account for sticky header
          pb: { xs: 8, md: 12 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Particle background */}
        <Box
          className="particles-container"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.2,
            zIndex: 0,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'white\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\' /%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  Unlock Smarter Learning with{' '} 
                  <span className="gradient-text">LearnLink</span>
                </Typography>
                <Typography 
                  variant="h6" 
                  paragraph
                  sx={{ 
                    mb: 2, 
                    maxWidth: '90%',
                    fontSize: '1.4rem',
                    fontWeight: 300,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  Personalized AI-powered learning that adapts to your style, transforming how you absorb and retain knowledge.
                </Typography>
                
                {/* New subtitle for USP */}
                <Typography 
                  variant="h5" 
                  paragraph
                  sx={{ 
                    mb: 4, 
                    fontWeight: 400,
                    fontSize: '1.2rem',
                    fontStyle: 'italic',
                    opacity: 0.9,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  Your personalized AI tutor — built for how you learn best.
                </Typography>
                
                <Stack direction="row" spacing={2}>
                  {currentUser ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button 
                        component={Link}
                        to="/dashboard"
                        variant="contained" 
                        color="secondary"
                        size="large"
                        startIcon={<DashboardIcon />}
                        sx={{ 
                          px: 4, 
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 8
                        }}
                      >
                        Return to Dashboard
                      </Button>
                    </motion.button>
                  ) : (
                    <motion.button
                      animate={pulseAnimation}
                      whileHover={{ scale: 1.05 }}
                      style={{ background: 'transparent', border: 'none', padding: 0 }}
                    >
                  <Button 
                    component={Link}
                    to="/register"
                    variant="contained" 
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 8
                    }}
                  >
                    Get Started for Free
                  </Button>
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                  >
                  <Button 
                    component={Link}
                    to="/how-it-works"
                    variant="contained" 
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 8,
                      bgcolor: 'white',
                      color: '#7C4DFF',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                  </motion.button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                className="hero-animation"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Box
                  component="img"
                  src="https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
                  alt="AI Learning Illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    filter: 'drop-shadow(0 0 25px rgba(106, 92, 231, 0.5))'
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        
        {/* Scroll indicator */}
        <ScrollIndicator 
          onClick={scrollToFeatures}
          animate={scrollIndicatorAnimation}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            Discover More
          </Typography>
          <KeyboardArrowDown />
        </ScrollIndicator>
      </Box>

      {/* Features Section */}
      <Container id="features-section" maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={8}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
          <Typography variant="overline" color="primary" fontWeight={600}>
            FEATURES
          </Typography>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' } 
            }}
          >
              Revolutionize the Way You Learn
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            LearnLink combines cutting-edge AI with proven learning methods to create
            a personalized education platform that adapts to your unique needs.
          </Typography>
          </motion.div>
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div 
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <Card 
                    className="feature-card"
                    component={Link}
                    to={`/features/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    sx={{ 
                      height: '100%', 
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      boxShadow: theme.palette.mode === 'light' 
                        ? '0px 10px 30px rgba(0, 0, 0, 0.03)' 
                        : '0px 10px 30px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0px 10px 30px rgba(124, 77, 255, 0.2)',
                        borderColor: '#7c4dff'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                      <Box 
                        sx={{ 
                          mb: 2,
                          transform: 'scale(1.2)',
                          color: index % 2 === 0 ? '#7c4dff' : '#5c6bc0'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
        
        {/* CTA in features section */}
        <Box textAlign="center" mt={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h5" gutterBottom color="text.primary" fontWeight={500}>
              Ready to experience smarter learning?
            </Typography>
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
              <Button 
                component={Link}
                to="/register"
                variant="contained" 
                color="primary"
                size="large"
                sx={{ 
                  mt: 2,
                  px: 4, 
                  py: 1.2,
                  borderRadius: 8
                }}
              >
                Get Started For Free
              </Button>
            </motion.button>
          </motion.div>
        </Box>
      </Container>

      {/* How It Works Preview Section */}
      <Box 
        sx={{ 
          bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#f9f9f9',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box textAlign="center" mb={8}>
              <Typography variant="overline" color="primary" fontWeight={600}>
                HOW IT WORKS
              </Typography>
              <Typography 
                variant="h2" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' } 
                }}
              >
                Simple Steps to Accelerate Your Learning
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 700, 
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                Getting started with LearnLink is easy. Follow these simple steps and transform your learning journey.
              </Typography>
            </Box>
          </motion.div>
          
          <Grid container spacing={6} justifyContent="center">
            {/* Step 1 */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #7c4dff 0%, #5c6bc0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    <School fontSize="large" />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    Learn
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our AI analyzes your content and creates personalized learning modules that adapt to your pace.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Step 2 */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #7c4dff 0%, #5c6bc0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    <Assessment fontSize="large" />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    Track Progress
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Monitor your learning journey with detailed analytics and adjust your learning path as needed.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)' 
            : 'linear-gradient(135deg, #7c4dff 0%, #5c6bc0 100%)',
          py: 8,
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Particle background */}
        <Box
          className="particles-container"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            zIndex: 0,
          }}
        />
      
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight={700}
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Ready to transform your learning journey?
            </Typography>
            <Typography 
              variant="h6" 
              paragraph 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Join thousands of students who are already experiencing the future of personalized education.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              {currentUser ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                  <Button 
                    component={Link}
                    to="/dashboard"
                    variant="contained" 
                    color="secondary"
                    size="large"
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      px: 5, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 8,
                      fontWeight: 600
                    }}
                  >
                    Return to Dashboard
                  </Button>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  animate={pulseAnimation}
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                  <Button 
                    component={Link}
                    to="/register"
                    variant="contained" 
                    color="secondary"
                    size="large"
                    sx={{ 
                      px: 5, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 8,
                      fontWeight: 600
                    }}
                  >
                    Get Started Now
                  </Button>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                style={{ background: 'transparent', border: 'none', padding: 0 }}
              >
                <Button 
                  component={Link}
                  to="/how-it-works"
                  variant="contained" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 8,
                    bgcolor: 'white',
                    color: '#7C4DFF',
                    '&:hover': {
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  See How It Works
                </Button>
              </motion.button>
            </Stack>
            
            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Box 
                sx={{ 
                  maxWidth: 900, 
                  mx: 'auto',
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                }}
              >
                <Box
                  component="img"
                  src="https://colorlib.com/wp/wp-content/As/sites/2/free-dashboard-templates-768x574.jpg"
                  alt="Dashboard Preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    transform: 'translateY(0)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(0,0,0,0.8))',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    p: 3
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    A preview of the LearnLink dashboard experience
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;