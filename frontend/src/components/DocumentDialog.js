import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  DownloadOutlined as DownloadIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../services/fileService';

const DocumentDialog = ({ fileId, fileName, open, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  useEffect(() => {
    const prepareDocument = async () => {
      try {
        if (!fileId) {
          setError('No file ID provided');
          setIsLoading(false);
          return;
        }
        
        // Just set the download URL without triggering auto-download
        setFileUrl(`${API_BASE_URL}/files/${fileId}/download`);
        setIsLoading(false);
      } catch (error) {
        console.error('Error preparing document:', error);
        setError(`Failed to load document: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    if (open) {
      setIsLoading(true);
      setError('');
      prepareDocument();
    }
  }, [fileId, open]);
  
  // Handle document download
  const handleDownload = () => {
    try {
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.setAttribute('download', fileName || `document-${fileId}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError(`Failed to download document: ${error.message || 'Unknown error'}`);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {fileName || 'Document Preview'}
          </Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%'
          }}>
            <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
            
            <Typography variant="h5" gutterBottom>
              {fileName || 'Document'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Document preview has been temporarily disabled. 
              You can download the document to view its contents.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ 
                borderRadius: 2, 
                px: 4
              }}
            >
              Download Document
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog; 