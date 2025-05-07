import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Modal, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { API_BASE_URL, getImageForTopic } from '../services/fileService';

const VisualExplanationCard = ({ title, image, text }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  // Check if the image is a YouTube URL
  const isYouTubeUrl = image && (image.includes('youtube.com') || image.includes('youtu.be'));
  
  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  const youtubeVideoId = isYouTubeUrl ? getYouTubeVideoId(image) : null;

  // Search for an image related to the card topic
  const searchImageForTopic = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getImageForTopic(title);
      
      if (data.success) {
        setGeneratedImage(data.image_url);
      } else {
        setError(data.error || 'Image search failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to search for image');
      console.error('Error searching for image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search for image on component mount if no image provided
  useEffect(() => {
    if (!image || image.includes('placeholder') || image.includes('default')) {
      searchImageForTopic();
    }
  }, []);

  // The image to display (either the provided one or the generated one)
  const displayImage = generatedImage || image;

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 280,
          maxWidth: 320,
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box
          sx={{
            height: 160,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'rgba(63, 81, 181, 0.05)',
            p: 2,
            position: 'relative',
          }}
        >
          {isLoading ? (
            <CircularProgress size={40} />
          ) : error ? (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="error" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={searchImageForTopic}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <>
              <img
                src={displayImage}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              {generatedImage && (
                <IconButton 
                  size="small" 
                  onClick={searchImageForTopic} 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: '#1a237e',
              fontWeight: 600,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary', 
              mb: 2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
            }}
          >
            {text}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleOpenModal}
              sx={{ 
                mt: 1,
                textTransform: 'none',
                borderColor: '#1a237e',
                color: '#1a237e',
                '&:hover': {
                  borderColor: '#3f51b5',
                  backgroundColor: 'rgba(63, 81, 181, 0.04)',
                }
              }}
            >
              View More
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Modal for full description and larger image */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby={`modal-${title}`}
        aria-describedby={`modal-description-${title}`}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '70%', md: '50%' },
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              id={`modal-${title}`} 
              variant="h5" 
              component="h2"
              sx={{ color: '#1a237e', fontWeight: 600 }}
            >
              {title}
            </Typography>
            <IconButton 
              onClick={handleCloseModal} 
              aria-label="close"
              sx={{ 
                color: 'text.secondary',
                padding: '4px',
                fontSize: 'small',
                backgroundColor: '#f5f5f5',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.1rem'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box 
            sx={{ 
              height: 300,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'rgba(63, 81, 181, 0.05)',
              borderRadius: 1,
              mb: 3,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {isLoading ? (
              <CircularProgress size={60} />
            ) : youtubeVideoId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`YouTube video related to ${title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <>
                <img
                  src={displayImage}
                  alt={title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
                {generatedImage && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={searchImageForTopic} 
                    startIcon={<RefreshIcon />}
                    disabled={isLoading}
                    sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      right: 16,
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  >
                    Find New Image
                  </Button>
                )}
              </>
            )}
          </Box>
          
          <Typography 
            id={`modal-description-${title}`} 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            {text}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default VisualExplanationCard; 