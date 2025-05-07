import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Box, Card, CardContent, Typography, Button, TextField, IconButton, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const Post = ({ post }) => {
  const [comment, setComment] = useState('');
  const { currentUser } = useAuth();
  const isLiked = post.likes?.includes(currentUser?.uid);
  const isBookmarked = post.bookmarks?.includes(currentUser?.uid);

  const handleLike = async () => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      if (isBookmarked) {
        await updateDoc(userRef, {
          bookmarks: arrayRemove(post.id)
        });
      } else {
        await updateDoc(userRef, {
          bookmarks: arrayUnion(post.id)
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !comment.trim()) return;

    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        content: comment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp()
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">{post.title}</Typography>
          <Chip label={post.topic} color="primary" size="small" />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Posted by {post.authorName}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2">{post.likes?.length || 0} likes</Typography>
          
          <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleComment} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" size="small" sx={{ mt: 1 }}>
            Comment
          </Button>
        </Box>

        {post.comments?.map((comment) => (
          <Box key={comment.id} sx={{ mt: 2, p: 1, bgcolor: 'grey.100' }}>
            <Typography variant="subtitle2">{comment.authorName}</Typography>
            <Typography variant="body2">{comment.content}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default Post; 