import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupsIcon,
  Forum as DiscussionsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Description as DocumentsIcon,
  Psychology as LearningStyleIcon,
  EmojiEvents as LeaderboardIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Responsive drawer widths
const DRAWER_WIDTH = {
  xs: 0,      // Hidden on mobile
  sm: 70,     // Mini drawer on tablets
  md: 240     // Full drawer on desktop
};

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Documents', icon: <DocumentsIcon />, path: '/documents' },
  { text: 'Quizzes', icon: <QuizIcon />, path: '/quizzes' },
  { text: 'Discussions', icon: <DiscussionsIcon />, path: '/discussions' },
  { text: 'Progress', icon: <AssessmentIcon />, path: '/progress' },
  { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
  { text: 'Learning Style Assessment', icon: <LearningStyleIcon />, path: '/learning-style' }
];

const Sidebar = ({ user, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const history = useHistory();
  const location = useLocation();

  const handleDrawerToggle = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleNavigation = (path) => {
    history.push(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  // Animation variants for active indicator
  const activeIndicatorVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { 
      opacity: 1, 
      height: '70%',
      transition: { duration: 0.3 }
    }
  };

  // Determine if sidebar is collapsed (for tablet view)
  const isCollapsed = isTablet;

  const drawer = (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        p: isCollapsed ? 1 : 2
      }}>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ 
              width: 40,
              height: 40,
              borderRadius: 1,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation items */}
      <List sx={{ mt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={isCollapsed ? item.text : ""} 
                placement="right"
                disableHoverListener={!isCollapsed}
              >
                <ListItemButton 
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    py: 1.5,
                    pl: isCollapsed ? 1.5 : 3,
                    position: 'relative',
                    overflow: 'hidden',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    minHeight: isCollapsed ? 48 : 56,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(106, 92, 231, 0.15)'
                        : 'rgba(106, 92, 231, 0.08)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(106, 92, 231, 0.25)'
                          : 'rgba(106, 92, 231, 0.12)',
                      }
                    },
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    transition: 'all 0.2s'
                  }}
                  selected={isActive}
                >
                  {isActive && (
                    <Box
                      component={motion.div}
                      initial="initial"
                      animate="animate"
                      variants={activeIndicatorVariants}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        width: 4,
                        borderRadius: 4,
                        bgcolor: 'primary.main',
                        boxShadow: `0 0 8px ${theme.palette.primary.main}`
                      }}
                    />
                  )}
                  <ListItemIcon 
                    sx={{ 
                      minWidth: isCollapsed ? 0 : 40,
                      color: isActive ? 'primary.main' : 'inherit',
                      transition: 'all 0.2s',
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        noWrap: true,
                        sx: {
                          transition: 'all 0.2s'
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  // Mobile drawer (only displayed when menu is opened)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH.md,
            zIndex: theme.zIndex.appBar + 1,
          },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  // Tablet drawer (collapsed/mini version)
  if (isTablet) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH.sm,
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
            zIndex: 1000,
            height: '100vh',
            top: 0,
            paddingTop: '64px',
            borderRadius: 0,
            borderTop: 0,
            bgcolor: 'background.paper',
            overflowX: 'hidden'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    );
  }

  // Desktop drawer (full-width version)
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH.md,
          borderRight: '1px solid',
          borderColor: 'divider',
          position: 'fixed',
          zIndex: 1000,
          height: '100vh',
          top: 0,
          paddingTop: '64px',
          borderRadius: 0,
          borderTop: 0,
          bgcolor: 'background.paper',
          overflowX: 'hidden'
        },
      }}
      open
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar; 