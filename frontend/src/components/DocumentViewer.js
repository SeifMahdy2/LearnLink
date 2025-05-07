import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Alert,
  Typography,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../services/fileService';

const DocumentViewer = ({ match, mode = 'summary', isDialog = false }) => {
  const theme = useTheme();
  const history = useHistory();
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get file ID from URL params or props
  const fileId = match?.params?.fileId;

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        if (!fileId) {
          setError('No file ID provided');
          setIsLoading(false);
          return;
        }

        // Just set the file ID and name without auto-downloading
        setFileName(`Document-${fileId}`);
        // Store the download URL but don't trigger download
        setFileUrl(`${API_BASE_URL}/files/${fileId}/download`);
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up document viewer:', error);
        setError(`Failed to load document: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    fetchFileDetails();
  }, [fileId]);

  // Handle document download when button is clicked
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

  // Back button to documents list
  const handleBack = () => {
    if (isDialog) {
      // Handle dialog close through parent component
      return;
    }
    history.push('/documents');
  };

  // Basic document view with download button
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'auto'
    }}>
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
              px: 4,
              mb: 2
            }}
          >
            Download Document
                  </Button>
          
          {!isDialog && (
            <Button
              variant="outlined"
              size="medium"
              onClick={handleBack}
                          sx={{ 
                mt: 2,
                            borderRadius: 2
                          }}
                        >
              Back to Documents
                      </Button>
                  )}
                </Box>
      )}
    </Box>
  );
};

export default DocumentViewer; 