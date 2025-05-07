import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Palette,
  LightMode,
  Nightlight,
  LockReset
} from '@mui/icons-material';
import ThemeContext from '../context/ThemeContext';
import { getCurrentUser, resetPassword } from '../services/authService';
import { updateProfile } from 'firebase/auth';
import { getAuthErrorMessage } from '../utils/firebaseErrors';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Settings = () => {
  const { toggleDarkMode, darkMode } = useContext(ThemeContext);
  const currentUser = getCurrentUser();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
  };
  
  const handleSaveChanges = async () => {
    if (!displayName.trim()) {
      setAlertMessage({
        type: 'error',
        message: 'Name cannot be empty'
      });
      return;
    }
    
    setIsSubmitting(true);
    setAlertMessage(null);
    
    try {
      await updateProfile(currentUser, {
        displayName: displayName
      });
      
      setAlertMessage({
        type: 'success',
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlertMessage({
        type: 'error',
        message: 'Failed to update profile: ' + error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    setResetPasswordDialogOpen(true);
  };

  const handleResetPasswordConfirm = async () => {
    setIsSubmitting(true);
    setAlertMessage(null);
    
    try {
      await resetPassword(currentUser.email);
      
      setAlertMessage({
        type: 'success',
        message: 'Password reset email sent successfully. Please check your inbox.'
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      setAlertMessage({
        type: 'error',
        message: getAuthErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
      setResetPasswordDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {/* Account Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            
            {alertMessage && (
              <Alert 
                severity={alertMessage.type}
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setAlertMessage(null)}
              >
                {alertMessage.message}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={currentUser?.photoURL}
                alt={currentUser?.displayName || 'User'}
                sx={{ width: 80, height: 80 }}
              >
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h6">
                  {currentUser?.displayName || 'User Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={displayName}
                  onChange={handleNameChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={currentUser?.email || ''}
                  margin="normal"
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    sx={{ borderRadius: 1 }}
                    onClick={handleResetPassword}
                    startIcon={<LockReset />}
                  >
                    Reset Password
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ borderRadius: 1 }}
                    onClick={handleSaveChanges}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Appearance Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Palette />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Switch between light and dark themes"
                />
                <IconButton
                  onClick={toggleDarkMode}
                  sx={{ 
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                  }}
                >
                  {darkMode ? <LightMode /> : <Nightlight />}
                </IconButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
        aria-labelledby="reset-password-dialog-title"
        aria-describedby="reset-password-dialog-description"
      >
        <DialogTitle id="reset-password-dialog-title">Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We will send a password reset link to your email address: 
            <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
              {currentUser?.email}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            After receiving the email, click on the link to set a new password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordConfirm} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 