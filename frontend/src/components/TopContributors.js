import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { Box, Typography, List, ListItem, ListItemText, Avatar } from '@mui/material';

const TopContributors = () => {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    fetchTopContributors();
  }, []);

  const fetchTopContributors = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('totalPosts', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      
      const fetchedContributors = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const postsRef = collection(db, 'posts');
          const userPostsQuery = query(
            postsRef,
            where('authorId', '==', doc.id)
          );
          const postsSnapshot = await getDocs(userPostsQuery);
          const totalLikes = postsSnapshot.docs.reduce((acc, post) => {
            return acc + (post.data().likes?.length || 0);
          }, 0);

          return {
            id: doc.id,
            name: userData.displayName || userData.email,
            totalPosts: userData.totalPosts || 0,
            totalLikes
          };
        })
      );

      setContributors(fetchedContributors);
    } catch (error) {
      console.error('Error fetching top contributors:', error);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Top Contributors
      </Typography>
      <List>
        {contributors.map((contributor) => (
          <ListItem key={contributor.id}>
            <Avatar sx={{ mr: 2 }}>
              {contributor.name.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary={contributor.name}
              secondary={`${contributor.totalPosts} posts • ${contributor.totalLikes} likes`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TopContributors; 