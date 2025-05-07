import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  LinearProgress, 
  Chip,
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';

function Progress() {
  // Mock data
  const courseProgress = [
    { id: 1, course: 'Mathematics', progress: 75, completed: 15, total: 20 },
    { id: 2, course: 'Physics', progress: 60, completed: 9, total: 15 },
    { id: 3, course: 'Computer Science', progress: 90, completed: 18, total: 20 },
    { id: 4, course: 'Chemistry', progress: 40, completed: 4, total: 10 },
  ];
  
  const recentActivities = [
    { id: 1, activity: 'Completed Quiz: Linear Algebra', date: '2 hours ago', icon: <CheckCircleIcon color="success" /> },
    { id: 2, activity: 'Uploaded Document: Physics Notes', date: '1 day ago', icon: <AssignmentIcon color="primary" /> },
    { id: 3, activity: 'Earned Badge: Fast Learner', date: '3 days ago', icon: <EmojiEventsIcon color="warning" /> },
    { id: 4, activity: 'Joined Study Group: Advanced Calculus', date: '1 week ago', icon: <SchoolIcon color="secondary" /> },
  ];

  const achievements = [
    { id: 1, name: 'Quiz Master', description: 'Completed 10 quizzes with score above 80%', progress: 70 },
    { id: 2, name: 'Document Pro', description: 'Uploaded and processed 20 documents', progress: 85 },
  ];

  return (
    <motion.div
      className="progress-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px' }}
    >
      <Typography variant="h4" gutterBottom>
        Your Learning Progress
      </Typography>
      
      <Grid container spacing={3}>
        {/* Overall Stats */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" height="100%">
              <Typography variant="h6" gutterBottom>
                Overall Progress
              </Typography>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                flex={1}
              >
                <Box position="relative" display="inline-flex" mb={2}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        width: 200,
                        height: 200,
                      }}
                    >
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h3" component="div" color="primary">
                          75%
                        </Typography>
                      </Box>
                      <CircularProgress
                        variant="determinate"
                        value={75}
                        size={200}
                        thickness={5}
                        color="primary"
                      />
                    </Box>
                  </motion.div>
                </Box>
                <Typography variant="body1">
                  Great progress! Keep up the good work.
                </Typography>
                <Box mt={2} width="100%">
                  <Chip label="46 Completed Tasks" color="success" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="12 Pending Tasks" color="warning" sx={{ mr: 1, mb: 1 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Course Progress */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Course Progress
            </Typography>
            <Box>
              {courseProgress.map((course) => (
                <Box key={course.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">{course.course}</Typography>
                    <Typography variant="body2">
                      {course.completed}/{course.total} units
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress} 
                    sx={{ height: 10, borderRadius: 5 }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ pb: 2 }}>
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {activity.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.activity}
                    secondary={activity.date}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Achievements & Badges
            </Typography>
            <Box>
              {achievements.map((achievement) => (
                <Card key={achievement.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <EmojiEventsIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{achievement.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Box width="100%" mr={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={achievement.progress} 
                          sx={{ height: 8, borderRadius: 5 }} 
                        />
                      </Box>
                      <Box minWidth={35}>
                        <Typography variant="body2" color="textSecondary">{`${achievement.progress}%`}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Progress; 