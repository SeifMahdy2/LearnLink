import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import VisualExplanationCard from './VisualExplanationCard';

const VisualExplanationViewer = ({ data, title = 'Visual Explanations', fileId }) => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enable direct API fetching if fileId is provided
  useEffect(() => {
    if (fileId) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/visual-concepts?fileId=${fileId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch visual concepts');
          return res.json();
        })
        .then(data => {
          console.log("Fetched visual concepts:", data);
          setCards(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching visual concepts:", err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [fileId]);

  // Use provided data if no fileId
  useEffect(() => {
    if (!fileId && data) {
      setCards(data);
    }
  }, [data, fileId]);

  // If no data and not fetching, return null
  if (!isLoading && !cards.length && !data) {
    return null;
  }

  // Log data for debugging
  console.log("Visual explanation data:", cards.length ? cards : data);

  return (
    <Box
      sx={{
        mt: 4,
        width: '100%',
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 2.5, 
          fontWeight: 500,
          color: 'primary.main'
        }}
      >
        {title}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      {isLoading && (
        <Typography>Loading visual concepts...</Typography>
      )}
      
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 3,
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 4,
          },
        }}
      >
        {Array.isArray(cards.length ? cards : data) ? (cards.length ? cards : data).map((item, index) => {
          // Skip rendering if item is not properly formatted
          if (!item || typeof item !== 'object') {
            console.error("Invalid item in visual explanations:", item);
            return null;
          }
          
          // Handle both formats (text or description)
          const text = item.text || item.description || '';
          
          if (!item.title || !item.image || !text) {
            console.error("Missing required fields in item:", item);
            return null;
          }
          
          return (
            <Box key={index} sx={{ flexShrink: 0 }}>
              <VisualExplanationCard
                title={item.title}
                image={item.image}
                text={text}
              />
            </Box>
          );
        }) : (
          <Typography color="error">
            Invalid data format for visual explanations
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VisualExplanationViewer; 