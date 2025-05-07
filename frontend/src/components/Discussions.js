import React, { useState, useContext, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Card, 
  CardContent, 
  CardActions,
  Avatar,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import SendIcon from '@mui/icons-material/Send';
import AuthContext from '../contexts/AuthContext';

function Discussions() {
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  
  // State variables
  const [discussions, setDiscussions] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  
  // Track which discussion's comments are open
  const [expandedComments, setExpandedComments] = useState(null);
  // State for new comment text
  const [commentText, setCommentText] = useState('');
  
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    topic: '',
    tags: ''
  });

  // Load discussions from localStorage on component mount
  useEffect(() => {
    const savedDiscussions = localStorage.getItem('discussions');
    if (savedDiscussions) {
      setDiscussions(JSON.parse(savedDiscussions));
    }
  }, []);

  // Calculate top contributors and trending topics whenever discussions change
  useEffect(() => {
    // Calculate top contributors
    const contributorsMap = new Map();
    
    discussions.forEach(discussion => {
      // Count post creation
      const authorId = discussion.author.id;
      const authorName = discussion.author.name;
      const authorAvatar = discussion.author.avatar;
      
      if (!contributorsMap.has(authorId)) {
        contributorsMap.set(authorId, {
          id: authorId,
          name: authorName,
          avatar: authorAvatar,
          posts: 0,
          likes: 0,
          comments: 0
        });
      }
      
      const contributor = contributorsMap.get(authorId);
      contributor.posts += 1;
      contributor.likes += discussion.likes || 0;
      
      // Count comments
      if (discussion.comments && discussion.comments.length > 0) {
        discussion.comments.forEach(comment => {
          const commentAuthorId = comment.author.id;
          const commentAuthorName = comment.author.name;
          const commentAuthorAvatar = comment.author.avatar;
          
          if (!contributorsMap.has(commentAuthorId)) {
            contributorsMap.set(commentAuthorId, {
              id: commentAuthorId,
              name: commentAuthorName,
              avatar: commentAuthorAvatar,
              posts: 0,
              likes: 0,
              comments: 0
            });
          }
          
          const commentContributor = contributorsMap.get(commentAuthorId);
          commentContributor.comments += 1;
        });
      }
    });
    
    // Convert map to array and sort by activity (posts + comments + likes)
    const sortedContributors = Array.from(contributorsMap.values())
      .sort((a, b) => {
        const scoreA = a.posts * 5 + a.comments * 2 + a.likes;
        const scoreB = b.posts * 5 + b.comments * 2 + b.likes;
        return scoreB - scoreA;
      })
      .slice(0, 5); // Take top 5
    
    setTopContributors(sortedContributors);
    
    // Calculate trending topics
    const topicsMap = new Map();
    
    discussions.forEach(discussion => {
      // Count main topic
      if (discussion.topic) {
        if (!topicsMap.has(discussion.topic)) {
          topicsMap.set(discussion.topic, 0);
        }
        topicsMap.set(discussion.topic, topicsMap.get(discussion.topic) + 3); // Weight topics more heavily
      }
      
      // Count tags
      if (discussion.tags && discussion.tags.length > 0) {
        discussion.tags.forEach(tag => {
          if (!topicsMap.has(tag)) {
            topicsMap.set(tag, 0);
          }
          topicsMap.set(tag, topicsMap.get(tag) + 1);
        });
      }
    });
    
    // Convert map to array and sort by count
    const sortedTopics = Array.from(topicsMap.entries())
      .map(([name, count]) => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Take top 8
    
    setTrendingTopics(sortedTopics);
  }, [discussions]);

  // Save discussions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('discussions', JSON.stringify(discussions));
  }, [discussions]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (topic) => {
    if (topic && topic !== selectedTopic) {
      setSelectedTopic(topic);
      // Reset to the Recent tab when changing filters
      setTabValue(0);
    }
    setFilterAnchorEl(null);
  };

  const handleCreateDiscussion = () => {
    // Process tags from comma-separated string to array
    const tagsArray = newDiscussion.tags
      ? newDiscussion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    // Create a new discussion object with all required fields
    const newPost = {
      id: Date.now(), // Use timestamp as a temporary ID
      title: newDiscussion.title,
      content: newDiscussion.content,
      topic: newDiscussion.topic,
      tags: tagsArray,
      author: {
        id: currentUser?.uid || 'anonymous',
        name: currentUser?.displayName || 'Anonymous User',
        avatar: currentUser?.photoURL || '',
      },
      createdAt: 'Just now',
      likes: 0,
      comments: [],
      liked: false,
      bookmarked: false
    };
    
    // Add the new discussion to the discussions array
    setDiscussions([newPost, ...discussions]);
    
    console.log('Creating new discussion:', newPost);
    
    // Close the dialog and reset form
    setOpenCreateDialog(false);
    setNewDiscussion({
      title: '',
      content: '',
      topic: '',
      tags: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDiscussion({
      ...newDiscussion,
      [name]: value
    });
  };

  const handleLikeToggle = (id) => {
    // Update the discussions array to toggle the like state
    setDiscussions(prevDiscussions => 
      prevDiscussions.map(discussion => 
        discussion.id === id 
          ? { 
              ...discussion, 
              liked: !discussion.liked,
              likes: discussion.liked ? discussion.likes - 1 : discussion.likes + 1 
            } 
          : discussion
      )
    );
  };

  const handleBookmarkToggle = (id) => {
    // Update the discussions array to toggle the bookmark state
    setDiscussions(prevDiscussions => 
      prevDiscussions.map(discussion => 
        discussion.id === id 
          ? { ...discussion, bookmarked: !discussion.bookmarked } 
          : discussion
      )
    );
  };

  // Comment related functions
  const toggleComments = (id) => {
    setExpandedComments(expandedComments === id ? null : id);
    setCommentText('');
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const addComment = (discussionId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      author: {
        id: currentUser?.uid || 'anonymous',
        name: currentUser?.displayName || 'Anonymous User',
        avatar: currentUser?.photoURL || '',
      },
      createdAt: 'Just now'
    };

    setDiscussions(prevDiscussions => 
      prevDiscussions.map(discussion => 
        discussion.id === discussionId 
          ? { 
              ...discussion, 
              comments: [...discussion.comments, newComment]
            } 
          : discussion
      )
    );

    setCommentText('');
  };

  // Filter discussions based on current tab, topic filter, and search term
  const getFilteredDiscussions = () => {
    // First filter by topic if not "All Topics"
    let filtered = discussions;
    
    if (selectedTopic !== 'All Topics') {
      filtered = filtered.filter(discussion => 
        discussion.topic === selectedTopic || 
        discussion.tags.includes(selectedTopic)
      );
    }
    
    // Then filter by search term
    filtered = filtered.filter(discussion => 
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Then filter by selected tab
    switch (tabValue) {
      case 0: // Recent
        return filtered.sort((a, b) => b.id - a.id);
      case 1: // Popular
        return filtered.sort((a, b) => b.likes - a.likes);
      case 2: // Bookmarked
        return filtered.filter(discussion => discussion.bookmarked);
      default:
        return filtered;
    }
  };

  const filteredDiscussions = getFilteredDiscussions();

  // Render discussion card
  const renderDiscussionCard = (discussion) => (
    <Grid item xs={12} key={discussion.id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center">
                <Avatar 
                  src={discussion.author.avatar} 
                  alt={discussion.author.name} 
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">{discussion.author.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {discussion.createdAt}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {discussion.title}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              {discussion.content}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" mb={2}>
              <Chip 
                label={discussion.topic} 
                color="primary" 
                variant="outlined" 
                size="small" 
                sx={{ mr: 1, mb: 1 }}
              />
              {discussion.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </CardContent>
          
          <Divider />
          
          <CardActions>
            <Button 
              size="small" 
              startIcon={discussion.liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => handleLikeToggle(discussion.id)}
              color={discussion.liked ? "primary" : "inherit"}
            >
              {discussion.likes}
            </Button>
            <Button 
              size="small" 
              startIcon={<CommentIcon />}
              onClick={() => toggleComments(discussion.id)}
              color={expandedComments === discussion.id ? "primary" : "inherit"}
            >
              {discussion.comments ? discussion.comments.length : 0}
            </Button>
            <Box flexGrow={1} />
            <IconButton 
              size="small"
              onClick={() => handleBookmarkToggle(discussion.id)}
              color={discussion.bookmarked ? "primary" : "inherit"}
            >
              {discussion.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </CardActions>

          {/* Comments Section */}
          <Collapse in={expandedComments === discussion.id} timeout="auto" unmountOnExit>
            <Divider />
            <Box p={2}>
              <Typography variant="subtitle2" gutterBottom>
                Comments
              </Typography>
              
              {/* Comment List */}
              <List>
                {discussion.comments && discussion.comments.length > 0 ? (
                  discussion.comments.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={comment.author.avatar} 
                          alt={comment.author.name} 
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {comment.author.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {comment.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={comment.text}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </List>
              
              {/* Comment Form */}
              <Box display="flex" mt={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  variant="outlined"
                  value={commentText}
                  onChange={handleCommentChange}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={() => addComment(discussion.id)}
                  disabled={!commentText.trim()}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Discussions</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          New Discussion
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
            <Box display="flex" alignItems="center">
              <TextField
                fullWidth
                placeholder="Search discussions..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                color={selectedTopic !== 'All Topics' ? "primary" : "inherit"}
              >
                {selectedTopic}
              </Button>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Recent" />
              <Tab label="Popular" />
              <Tab label="Bookmarked" />
            </Tabs>
          </Paper>

          {filteredDiscussions.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {tabValue === 2 
                  ? "No bookmarked discussions" 
                  : "No discussions found"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {tabValue === 2 
                  ? "Bookmark discussions to see them here" 
                  : "Try adjusting your search terms or start a new discussion"}
              </Typography>
              {tabValue !== 2 && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  onClick={handleCreateDialogOpen}
                >
                  Start New Discussion
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredDiscussions.map(discussion => renderDiscussionCard(discussion))}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Top Contributors */}
          <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Contributors
            </Typography>
            {topContributors.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                No contributors data available.
              </Typography>
            ) : (
              <List>
                {topContributors.map((contributor) => (
                  <ListItem key={contributor.id} disablePadding sx={{ mb: 2 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={contributor.avatar} 
                        alt={contributor.name} 
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={contributor.name} 
                      secondary={
                        `${contributor.posts} ${contributor.posts === 1 ? 'post' : 'posts'} · ` +
                        `${contributor.comments} ${contributor.comments === 1 ? 'comment' : 'comments'} · ` +
                        `${contributor.likes} ${contributor.likes === 1 ? 'like' : 'likes'}`
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Trending Topics */}
          <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trending Topics
            </Typography>
            {trendingTopics.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                No trending topics available.
              </Typography>
            ) : (
              <Box>
                {trendingTopics.map((topic) => (
                  <Chip 
                    key={topic.id}
                    label={`${topic.name} (${topic.count})`} 
                    variant="outlined" 
                    sx={{ mr: 1, mb: 1 }}
                    clickable
                    onClick={() => setSearchTerm(topic.name)}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Tips */}
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Discussion Tips
            </Typography>
            <Typography variant="body2" paragraph>
              • Be specific in your questions for better responses
            </Typography>
            <Typography variant="body2" paragraph>
              • Use appropriate tags to categorize your discussion
            </Typography>
            <Typography variant="body2" paragraph>
              • Share your own attempts at solving problems
            </Typography>
            <Typography variant="body2">
              • Be respectful and open to different viewpoints
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => handleFilterClose()}
      >
        <MenuItem onClick={() => handleFilterClose('All Topics')}>All Topics</MenuItem>
        <MenuItem onClick={() => handleFilterClose('Computer Science')}>Computer Science</MenuItem>
        <MenuItem onClick={() => handleFilterClose('Mathematics')}>Mathematics</MenuItem>
        <MenuItem onClick={() => handleFilterClose('Physics')}>Physics</MenuItem>
        <MenuItem onClick={() => handleFilterClose('Chemistry')}>Chemistry</MenuItem>
        <MenuItem onClick={() => handleFilterClose('Biology')}>Biology</MenuItem>
        {/* Dynamically add trending topics if they're not already in the list */}
        {trendingTopics
          .filter(topic => 
            !['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].includes(topic.name) &&
            topic.name !== 'All Topics'
          )
          .slice(0, 3)
          .map(topic => (
            <MenuItem key={topic.id} onClick={() => handleFilterClose(topic.name)}>
              {topic.name}
            </MenuItem>
          ))
        }
      </Menu>

      {/* Create Discussion Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <Box py={1}>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              fullWidth
              variant="outlined"
              value={newDiscussion.title}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              placeholder="What would you like to discuss?"
            />
            <TextField
              margin="dense"
              name="content"
              label="Content"
              fullWidth
              variant="outlined"
              multiline
              rows={6}
              value={newDiscussion.content}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              placeholder="Provide details about your question or topic..."
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Topic</InputLabel>
              <Select
                name="topic"
                value={newDiscussion.topic}
                onChange={handleInputChange}
                label="Topic"
              >
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="tags"
              label="Tags (comma separated)"
              fullWidth
              variant="outlined"
              value={newDiscussion.tags}
              onChange={handleInputChange}
              placeholder="e.g. programming, algorithms, data structures"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreateDiscussion} 
            color="primary" 
            variant="contained"
            disabled={!newDiscussion.title || !newDiscussion.content || !newDiscussion.topic}
          >
            Post Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Discussions; 