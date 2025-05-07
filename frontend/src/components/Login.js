import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { 
  loginWithEmailAndPassword, 
  registerWithEmailAndPassword, 
  signInWithGoogle, 
  logoutUser
} from '../services/authService';
import { getAuthErrorMessage } from '../utils/firebaseErrors';
import AuthContext from '../contexts/AuthContext';

const Login = ({ onLogin, isRegister = false }) => {
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const isMounted = useRef(true);
  const { currentUser } = useContext(AuthContext);
  const isLoggingIn = useRef(false);
  const [activeTab, setActiveTab] = useState(isRegister ? 1 : 0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [logoutReason, setLogoutReason] = useState(null);

  // Check for login message in location state (e.g. from session timeout/expiry)
  useEffect(() => {
    if (location.state && location.state.message) {
      setLogoutReason({
        type: location.state.messageType || 'info',
        message: location.state.message
      });
      
      // Clear the location state to prevent showing the message again on page refresh
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.from && location.state.from.pathname) {
      // User was redirected from a protected route
      setLogoutReason({
        type: 'info',
        message: 'Please log in to access this page.'
      });
    } else if (sessionStorage.getItem('sessionExpired')) {
      // Session expired message
      setLogoutReason({
        type: 'warning',
        message: 'Your session has expired. Please log in again.'
      });
      sessionStorage.removeItem('sessionExpired');
    }
  }, [location]);

  // Automatically logout when visiting the login page, but only on first mount
  useEffect(() => {
    // Only run this once when the component first mounts
    const autoLogout = async () => {
      if (currentUser && !isLoggingIn.current) {
        try {
          console.log("Auto-logging out user on login/signup page");
          await logoutUser();
          setLogoutReason({
            type: 'info',
            message: 'You have been logged out for security reasons. Please log in again.'
          });
        } catch (error) {
          console.error("Error auto-logging out:", error);
        }
      }
    };
    
    autoLogout();
    // Only run once on mount, not when currentUser changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2 
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrors({});
    setAlertMessage(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific errors as user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (activeTab === 1 && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Name validation (only for register)
    if (activeTab === 1 && !formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Confirm password validation (only for register)
    if (activeTab === 1 && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset alert message
    setAlertMessage(null);
    setLogoutReason(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      isLoggingIn.current = true;
      
      if (activeTab === 0) {
        // Login
        await loginWithEmailAndPassword(formData.email, formData.password);
        if (onLogin) onLogin();
        history.push('/dashboard');
        } else {
        // Register
        await registerWithEmailAndPassword(formData.email, formData.password, formData.name);
        if (onLogin) onLogin();
        history.push('/dashboard');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAlertMessage({
        type: 'error',
        message: getAuthErrorMessage(error)
      });
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
        isLoggingIn.current = false;
      }
    }
  };

  // Social login handlers
  const handleGoogleLogin = async () => {
    isLoggingIn.current = true;
    setIsSubmitting(true);
    
    try {
      await signInWithGoogle();
      if (onLogin && isMounted.current) onLogin();
      history.push('/dashboard');
    } catch (error) {
      console.error("Google login error:", error);
      
      // More detailed error for Firestore issues
      const errorMsg = error.message && error.message.includes("Failed to save user data") 
        ? "Failed to create your account in our system. Please try again or contact support."
        : getAuthErrorMessage(error);
        
      if (isMounted.current) {
        setAlertMessage({
          type: 'error',
          text: errorMsg
        });
        // Reset the logging in flag if there's an error
        isLoggingIn.current = false;
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 4,
            border: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h4" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ mb: 3, fontWeight: 700 }}
            >
              {activeTab === 0 ? 'Welcome Back' : 'Create Account'}
            </Typography>
          </motion.div>
          
          {/* Display logout reason message */}
          {logoutReason && (
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity={logoutReason.type}
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setLogoutReason(null)}
              >
                {logoutReason.message}
              </Alert>
            </motion.div>
          )}
          
          {/* Display error message */}
          {alertMessage && (
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity={alertMessage.type}
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setAlertMessage(null)}
              >
                {alertMessage.message}
              </Alert>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
          </motion.div>
          
          <Box component="form" onSubmit={handleSubmit}>
            {activeTab === 1 && (
              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
              />
            )}
            
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            {activeTab === 1 && (
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ mb: 2 }}
              />
            )}
            
            {activeTab === 0 && (
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Button 
                  component={Link} 
                  to="/forgot-password" 
                  color="primary" 
                  size="small"
                >
                  Forgot password?
                </Button>
              </Box>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 1,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : isRegister ? 'Sign Up' : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              sx={{ py: 1.5, borderRadius: 1 }}
            >
              Continue with Google
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;
