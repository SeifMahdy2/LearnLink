import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { getCurrentUser } from '../services/authService';

const Layout = ({ children, drawerOpen, handleDrawerToggle }) => {
  const currentUser = getCurrentUser();
  
  return (
    <Box sx={{ 
      display: 'flex',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <Sidebar 
        user={currentUser} 
        open={drawerOpen} 
        onClose={handleDrawerToggle}
      />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ml: { xs: 0, sm: '70px', md: '240px' },
          width: { xs: '100%', sm: 'calc(100% - 70px)', md: 'calc(100% - 240px)' },
          minHeight: '100vh', // Full height
          backgroundColor: (theme) => theme.palette.background.default,
          position: 'relative',
          zIndex: 1050, // Higher than sidebar but lower than navbar
          transition: 'margin-left 0.3s, width 0.3s',
          borderRadius: 0,
          mt: 0, // No top margin
          p: 0, // No padding
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 