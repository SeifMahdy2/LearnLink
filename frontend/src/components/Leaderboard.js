import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Button,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalFireDepartment as StreakIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../services/authService';

const Leaderboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({
    topStreaks: [],
    topLearningTime: []
  });
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Current user ID
  const currentUser = getCurrentUser();
  const currentUserId = currentUser ? currentUser.uid : null;

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/leaderboard');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.leaderboard) {
          setLeaderboardData(data.leaderboard);
          setLastUpdated(data.leaderboard.lastUpdated ? new Date(data.leaderboard.lastUpdated) : new Date());
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format minutes as hours
  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:5000/api/leaderboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
        setLastUpdated(data.leaderboard.lastUpdated ? new Date(data.leaderboard.lastUpdated) : new Date());
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon 
              color="primary" 
              sx={{ fontSize: 32, mr: 1.5 }}
            />
            <Typography variant="h4" component="h1" fontWeight={700}>
              Leaderboard
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            variant="outlined" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Compete with other learners and climb the ranks! Last updated: {formatLastUpdated()}
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 600,
              py: 1.5
            }
          }}
        >
          <Tab 
            icon={<StreakIcon />} 
            iconPosition="start"
            label="Login Streaks" 
          />
          <Tab 
            icon={<TimeIcon />} 
            iconPosition="start"
            label="Learning Time" 
          />
        </Tabs>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '& th': {
                        fontWeight: 700
                      }
                    }}
                  >
                    <TableCell sx={{ width: '10%' }}>Rank</TableCell>
                    <TableCell sx={{ width: '50%' }}>User</TableCell>
                    {activeTab === 0 ? (
                      <TableCell align="right" sx={{ width: '40%' }}>Streak</TableCell>
                    ) : (
                      <TableCell align="right" sx={{ width: '40%' }}>Time</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTab === 0 ? (
                    leaderboardData.topStreaks && leaderboardData.topStreaks.length > 0 ? (
                      leaderboardData.topStreaks.map((user, index) => (
                        <TableRow 
                          key={user.userId} 
                          sx={{ 
                            '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                            ...(user.userId === currentUserId && { bgcolor: alpha(theme.palette.primary.main, 0.05) }),
                          }}
                        >
                          <TableCell>
                            {index === 0 ? (
                              <Chip 
                                size="small"
                                label="1st" 
                                color="primary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : index === 1 ? (
                              <Chip 
                                size="small"
                                label="2nd" 
                                color="secondary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : index === 2 ? (
                              <Chip 
                                size="small"
                                label="3rd"
                                color="warning" 
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : (
                              `${index + 1}th`
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 30, 
                                  height: 30, 
                                  mr: 1, 
                                  bgcolor: user.userId === currentUserId ? 'primary.main' : 'secondary.main',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography 
                                variant="body2" 
                                fontWeight={user.userId === currentUserId ? 700 : 400}
                              >
                                {user.username}
                                {user.userId === currentUserId && (
                                  <Chip 
                                    size="small" 
                                    label="You" 
                                    color="primary" 
                                    sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} 
                                  />
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <StreakIcon color="warning" sx={{ mr: 0.5 }} />
                              <Typography fontWeight={500}>
                                {user.streak} {user.streak === 1 ? 'day' : 'days'}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No streak data available</Typography>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    leaderboardData.topLearningTime && leaderboardData.topLearningTime.length > 0 ? (
                      leaderboardData.topLearningTime.map((user, index) => (
                        <TableRow 
                          key={user.userId} 
                          sx={{ 
                            '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                            ...(user.userId === currentUserId && { bgcolor: alpha(theme.palette.primary.main, 0.05) }),
                          }}
                        >
                          <TableCell>
                            {index === 0 ? (
                              <Chip 
                                size="small"
                                label="1st" 
                                color="primary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : index === 1 ? (
                              <Chip 
                                size="small"
                                label="2nd" 
                                color="secondary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : index === 2 ? (
                              <Chip 
                                size="small"
                                label="3rd"
                                color="warning" 
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : (
                              `${index + 1}th`
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 30, 
                                  height: 30, 
                                  mr: 1, 
                                  bgcolor: user.userId === currentUserId ? 'primary.main' : 'secondary.main',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography 
                                variant="body2" 
                                fontWeight={user.userId === currentUserId ? 700 : 400}
                              >
                                {user.username}
                                {user.userId === currentUserId && (
                                  <Chip 
                                    size="small" 
                                    label="You" 
                                    color="primary" 
                                    sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} 
                                  />
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <TimeIcon color="info" sx={{ mr: 0.5 }} />
                              <Typography fontWeight={500}>
                                {formatHours(user.timeSpent)}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No learning time data available</Typography>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default Leaderboard; 