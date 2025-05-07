import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  KeyboardArrowDown,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Brightness7 as Brightness7Icon,
  Brightness4 as Brightness4Icon
} from '@mui/icons-material';
import { Link, useHistory, useLocation } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import AuthContext from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { logoutUser } from '../services/authService';

const Navbar = ({ handleDrawerToggle }) => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Check if current path is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // For mobile menu
  const [anchorElNav, setAnchorElNav] = useState(null);
  
  // For features dropdown
  const [featuresAnchor, setFeaturesAnchor] = useState(null);
  
  // For user menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenFeatures = (event) => {
    setFeaturesAnchor(event.currentTarget);
  };

  const handleCloseFeatures = () => {
    setFeaturesAnchor(null);
  };
  
  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const navigateTo = (path) => {
    history.push(path);
    handleCloseNavMenu();
    handleCloseFeatures();
    handleCloseUserMenu();
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      handleCloseUserMenu();
    }
  };

  // Animation variants
  const logoVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  const pages = [
    { name: 'Features', path: '/features', hasDropdown: true },
    { name: 'How It Works', path: '/how-it-works', hasDropdown: false },
  ];

  const featureItems = [
    { name: 'AI Learning', path: '/features/ai-learning' },
    { name: 'Document Processing', path: '/features/document-processing' },
    { name: 'Adaptive Quizzes', path: '/features/quizzes' },
    { name: 'Learning Analytics', path: '/features/analytics' }
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        zIndex: theme.zIndex.appBar,
        borderRadius: 0,
        width: '100%'
      }}
    >
      <Container maxWidth={false} disableGutters>
        <Toolbar 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            width: '100%',
            px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
            py: { xs: 0.5, sm: 0.75, md: 1 },
            minHeight: { xs: '56px', sm: '64px' }
          }}
        >
          {/* Logo - Left aligned */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0,
            minWidth: { xs: '100px', sm: '120px', md: '150px' }
          }}>
            <motion.div
              whileHover="hover"
              variants={logoVariants}
            >
              <Link to="/">
                <Box
                  component="img"
                  src="/Logo.png"
                  alt="LearnLink Logo"
                  sx={{
                    height: { xs: '32px', sm: '36px', md: '40px' },
                    width: 'auto',
                  }}
                />
              </Link>
            </motion.div>
          </Box>

          {/* Navigation Links - Center */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            flexGrow: 1,
            justifyContent: 'center',
          }}>
            {pages.map((page) => (
              page.hasDropdown ? (
                <React.Fragment key={page.name}>
                  <Button
                    onClick={handleOpenFeatures}
                    sx={{ 
                      mx: { md: 1, lg: 2 }, 
                      color: 'text.primary',
                      fontSize: { md: '0.875rem', lg: '1rem' },
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                    endIcon={<KeyboardArrowDown />}
                  >
                    {page.name}
                  </Button>
                  <Menu
                    id="features-menu"
                    anchorEl={featuresAnchor}
                    open={Boolean(featuresAnchor)}
                    onClose={handleCloseFeatures}
                    MenuListProps={{
                      'aria-labelledby': 'features-button',
                    }}
                  >
                    {featureItems.map((item) => (
                      <MenuItem 
                        key={item.path} 
                        onClick={() => navigateTo(item.path)}
                      >
                        {item.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              ) : (
                <Button
                  key={page.name}
                  onClick={() => navigateTo(page.path)}
                  sx={{ 
                    mx: { md: 1, lg: 2 }, 
                    color: 'text.primary',
                    fontSize: { md: '0.875rem', lg: '1rem' },
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  {page.name}
                </Button>
              )
            ))}
          </Box>

          {/* Settings icon - Right */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexShrink: 0,
            minWidth: { xs: '80px', sm: '100px', md: '150px' }
          }}>
            {currentUser && !isAuthPage ? (
              <>
                {/* User Avatar - replaces Account Settings button */}
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleOpenUserMenu}
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      ml: { xs: 0.5, sm: 1 },
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                    }}
                  >
                    <Avatar 
                      alt={currentUser.displayName}
                      src={currentUser.photoURL}
                      sx={{ 
                        width: { xs: 32, sm: 36, md: 40 }, 
                        height: { xs: 32, sm: 36, md: 40 },
                        bgcolor: 'primary.main',
                        border: '2px solid',
                        borderColor: 'transparent',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {currentUser.photoURL ? '' : currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '?'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                {/* Dashboard icon - shows on smaller screens */}
                {isMobile && (
                  <IconButton
                    color="inherit"
                    aria-label="toggle menu"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ 
                      mr: 2, 
                      display: { sm: 'none' },
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                
                {/* User Menu */}
                <Menu
                  id="user-menu"
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 2,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      width: { xs: 180, sm: 200 },
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
                    <Typography variant="subtitle1" fontWeight={600} noWrap>{currentUser?.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{currentUser?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => navigateTo('/profile')}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => navigateTo('/settings')}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <MenuItem onClick={() => navigateTo('/contact')}>
                    <ListItemIcon>
                      <HelpIcon fontSize="small" />
                    </ListItemIcon>
                    Contact Us
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{ 
                    mr: { xs: 1, sm: 2 },
                    display: { xs: isSmallMobile ? 'none' : 'inline-flex', sm: 'inline-flex' }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/register"
                  sx={{ display: { xs: 'inline-flex' } }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>

          {/* Mobile menu button - Only shown on small screens */}
          {isMobile && !currentUser && !isAuthPage && (
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="medium"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                sx={{ 
                  ml: { xs: 0.5, sm: 1 },
                  padding: { xs: 0.5, sm: 1 },
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                }}
              >
                <MenuIcon fontSize={isSmallMobile ? "small" : "medium"} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
                PaperProps={{
                  sx: {
                    width: { xs: 200, sm: 250 },
                    maxHeight: '80vh',
                    overflowY: 'auto'
                  }
                }}
              >
                {pages.map((page) => 
                  !page.hasDropdown ? (
                    <MenuItem key={page.name} onClick={() => navigateTo(page.path)}>
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ) : (
                    <React.Fragment key={page.name}>
                      <MenuItem disabled>
                        <Typography fontWeight="bold">{page.name}</Typography>
                      </MenuItem>
                      {featureItems.map((item) => (
                        <MenuItem 
                          key={item.path}
                          onClick={() => navigateTo(item.path)}
                          sx={{ pl: 3 }}
                        >
                          {item.name}
                        </MenuItem>
                      ))}
                      <Divider />
                    </React.Fragment>
                  )
                )}
                <MenuItem onClick={() => navigateTo('/login')}>
                  <Typography textAlign="center">Login</Typography>
                </MenuItem>
                <MenuItem onClick={() => navigateTo('/register')}>
                  <Typography textAlign="center">Sign Up</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
