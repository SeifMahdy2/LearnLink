import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useHistory } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { getAuthErrorMessage } from '../utils/firebaseErrors';

const ForgotPassword = () => {
  const theme = useTheme();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.2,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setAlertMessage(null);
  };

  const validateEmail = () => {
    if (!email) {
      setAlertMessage({
        type: 'error',
        message: 'Email is required'
      });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setAlertMessage({
        type: 'error',
        message: 'Email is invalid'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
      setAlertMessage({
        type: 'success',
        message: 'Password reset link has been sent to your email.'
      });
    } catch (error) {
      console.error("Password reset error:", error);
      setAlertMessage({
        type: 'error',
        message: getAuthErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
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
              Reset Your Password
            </Typography>
          </motion.div>
          
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
          
          {!emailSent ? (
            <>
              <motion.div variants={itemVariants}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
              </motion.div>
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  sx={{ mb: 3 }}
                  autoFocus
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1,
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </Box>
            </>
          ) : (
            <motion.div variants={itemVariants}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                If an account exists with this email, you'll receive a password reset link shortly.
                Please check your inbox and follow the instructions to reset your password.
              </Typography>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                component={Link}
                to="/login"
                color="primary"
                sx={{ borderRadius: 1 }}
              >
                Back to Login
              </Button>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ForgotPassword; 