import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, where, getDocs, limit, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Box, Tabs, Tab, Typography, Container, CircularProgress, Alert } from '@mui/material';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const Discussions = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const topics = ['all', 'Math', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Engineering', 'Other'];

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchPosts(),
        currentUser ? fetchBookmarkedPosts() : Promise.resolve(),
        fetchPopularPosts()
      ]);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser, selectedTopic]);

  const fetchPosts = async () => {
    try {
      let q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      if (selectedTopic !== 'all') {
        q = query(q, where('topic', '==', selectedTopic));
      }
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.createdAt || Date.now())
        };
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  const fetchBookmarkedPosts = async () => {
    try {
      const userDoc = await getDocs(doc(db, 'users', currentUser.uid));
      const bookmarks = userDoc.data()?.bookmarks || [];
      const bookmarkedPostsQuery = query(
        collection(db, 'posts'),
        where('__name__', 'in', bookmarks)
      );
      const querySnapshot = await getDocs(bookmarkedPostsQuery);
      const fetchedBookmarks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt || Date.now())
      }));
      setBookmarkedPosts(fetchedBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
      throw error;
    }
  };

  const fetchPopularPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('likes', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const fetchedPopular = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt || Date.now())
      }));
      setPopularPosts(fetchedPopular);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      throw error;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  const handlePostCreated = () => {
    fetchAllData();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Discussions
        </Typography>

        <CreatePost onPostCreated={handlePostCreated} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="All Posts" />
            <Tab label="Popular" />
            <Tab label="Bookmarks" />
          </Tabs>
        </Box>

        <Box sx={{ mb: 2 }}>
          <select value={selectedTopic} onChange={handleTopicChange}>
            {topics.map(topic => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All Topics' : topic}
              </option>
            ))}
          </select>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 0 && (
              <Box>
                {posts.length === 0 ? (
                  <Typography>No posts found. Be the first to create one!</Typography>
                ) : (
                  posts.map(post => (
                    <Post key={post.id} post={post} />
                  ))
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {popularPosts.length === 0 ? (
                  <Typography>No popular posts yet.</Typography>
                ) : (
                  popularPosts.map(post => (
                    <Post key={post.id} post={post} />
                  ))
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                {bookmarkedPosts.length === 0 ? (
                  <Typography>No bookmarked posts yet.</Typography>
                ) : (
                  bookmarkedPosts.map(post => (
                    <Post key={post.id} post={post} />
                  ))
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Discussions; 