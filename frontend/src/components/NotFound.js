import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', // Subtract navbar height
        padding: 3,
        textAlign: 'center'
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 4 }}>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button 
        component={Link} 
        to="/" 
        variant="contained" 
        color="primary"
        size="large"
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NotFound; 