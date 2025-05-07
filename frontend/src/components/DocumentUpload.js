import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  DialogActions,
  List,
  ListItem,
  IconButton,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AuthContext from '../contexts/AuthContext';
import { uploadFile } from '../services/storageService';
import { getUserLearningStyle } from '../services/authService';
import { getDefaultLearningStyle } from '../services/userPreferencesService';
import { useHistory, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DocumentUpload = ({ isDialog = false, onClose, onUploadComplete }) => {
  const { currentUser } = useContext(AuthContext);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(true);
  const [fetchingDefaults, setFetchingDefaults] = useState(true);
  const history = useHistory();

  // Check if user has completed the learning style assessment
  useEffect(() => {
    const checkLearningStyleStatus = async () => {
      try {
        setLoadingAssessment(true);
        const result = await getUserLearningStyle();
        
        // If the lastUpdated property exists, the assessment has been completed
        setHasCompletedAssessment(!!result.lastUpdated);
      } catch (error) {
        console.error('Error checking learning style status:', error);
        setHasCompletedAssessment(false);
      } finally {
        setLoadingAssessment(false);
      }
    };

    if (currentUser) {
      checkLearningStyleStatus();
    }
  }, [currentUser]);
  
  // Fetch and apply default learning style
  useEffect(() => {
    const fetchDefaultLearningStyle = async () => {
      try {
        setFetchingDefaults(true);
        const defaultStyleResult = await getDefaultLearningStyle();
        if (defaultStyleResult.success) {
          setLearningStyle(defaultStyleResult.defaultStyle);
        }
      } catch (error) {
        console.error('Error fetching default learning style:', error);
        // Keep the default 'visual' style if there's an error
      } finally {
        setFetchingDefaults(false);
      }
    };
    
    if (currentUser) {
      fetchDefaultLearningStyle();
    }
  }, [currentUser]);

  const handleFileChange = (event) => {
    if (event.target.files?.length) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError('');
      setUploadSuccess(false);
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleRemoveAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleLearningStyleChange = (event) => {
    setLearningStyle(event.target.value);
  };

  const handleUpload = async () => {
    if (!hasCompletedAssessment) {
      setError('Please complete the learning style assessment before uploading documents');
      return;
    }
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    if (!learningStyle) {
      setError('Please select a learning style for your document');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to upload files');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);
      
      const uploadedFileIds = [];
      
      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // Update progress for each file
        setUploadProgress(Math.round((i / selectedFiles.length) * 100));
        
        const result = await uploadFile(file, learningStyle);
        
        if (result.success) {
          uploadedFileIds.push(result.fileId);
        } else {
          throw new Error(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`);
        }
      }
      
      // All files uploaded successfully
      setUploadProgress(100);
      setUploadSuccess(true);
      setSelectedFiles([]);
      
      if (isDialog && onUploadComplete) {
        // If in dialog mode, call the onUploadComplete callback with all file IDs
        onUploadComplete(uploadedFileIds);
        // Close the dialog after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        // Always redirect to documents page
        setTimeout(() => {
          history.push('/documents');
        }, 1500);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(`Failed to upload documents: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files?.length) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError('');
      setUploadSuccess(false);
    }
  }, []);

  const containerSx = isDialog 
    ? { width: '100%' } 
    : { maxWidth: 800, mx: 'auto', p: 2 };

  return (
    <Box sx={containerSx}>
      {!isDialog && (
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Upload Document
        </Typography>
      )}
      
      <Paper
        elevation={isDialog ? 0 : 3}
        sx={{
          p: isDialog ? 2 : 4,
          mt: isDialog ? 0 : 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {!hasCompletedAssessment && !loadingAssessment && (
          <Alert 
            severity="warning" 
            sx={{ width: '100%', mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                component={Link}
                to="/learning-style"
                startIcon={<PsychologyIcon />}
              >
                Take Assessment
              </Button>
            }
          >
            Please complete the learning style assessment before uploading documents. This helps us optimize your content for better learning.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {selectedFiles.length > 1 
              ? 'Documents uploaded successfully!' 
              : 'Document uploaded successfully!'}
          </Alert>
        )}
        
        <Box
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          sx={{
            width: '100%',
            p: 3,
            border: `2px dashed ${isDragActive ? '#1976d2' : '#ccc'}`,
            borderRadius: 2,
            textAlign: 'center',
            mb: 3,
            bgcolor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : '#f8f9fa',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          {selectedFiles.length > 0 ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Selected files ({selectedFiles.length})
                </Typography>
                <Button 
                  onClick={handleRemoveAllFiles}
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ borderRadius: 1 }}
                >
                  Clear All
                </Button>
              </Box>
              <List sx={{ width: '100%', maxHeight: '200px', overflow: 'auto', mb: 2 }}>
                {selectedFiles.map((file, index) => (
                  <ListItem 
                    key={`${file.name}-${index}`} 
                    dense
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleRemoveFile(file)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ borderRadius: 1 }}
                disabled={!hasCompletedAssessment && !loadingAssessment}
              >
                Add More Files
                <VisuallyHiddenInput 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt" 
                  multiple
                />
              </Button>
            </Box>
          ) : (
            <Box>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.7, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag & Drop Files Here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or
              </Typography>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  py: 1.5,
                  bgcolor: '#5e6edc', 
                  '&:hover': { bgcolor: '#4a5dc7' },
                  borderRadius: 1
                }}
                disabled={!hasCompletedAssessment && !loadingAssessment}
              >
                Select Documents
                <VisuallyHiddenInput 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt" 
                  multiple
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                Supported formats: PDF, DOC, DOCX, TXT
              </Typography>
            </Box>
          )}
        </Box>
        
        <FormControl fullWidth variant="outlined" sx={{ mt: 3, mb: 3 }}>
          <InputLabel id="learning-style-label">Learning Style</InputLabel>
          <Select
            labelId="learning-style-label"
            id="learning-style"
            value={learningStyle}
            label="Learning Style"
            onChange={handleLearningStyleChange}
            disabled={!hasCompletedAssessment && !loadingAssessment || fetchingDefaults}
          >
            <MenuItem value="visual">Visual</MenuItem>
            <MenuItem value="auditory">Auditory</MenuItem>
            <MenuItem value="reading_writing">Reading/Writing</MenuItem>
            <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
          </Select>
        </FormControl>
        
        {isDialog ? (
          <DialogActions sx={{ px: 0, justifyContent: 'space-between', width: '100%' }}>
            <Button 
              onClick={onClose} 
              variant="outlined"
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={(selectedFiles.length === 0 || isUploading || (!hasCompletedAssessment && !loadingAssessment))}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                py: 1.5,
                bgcolor: '#5e6edc', 
                '&:hover': { bgcolor: '#4a5dc7' },
                borderRadius: 1
              }}
            >
              {isUploading 
                ? `Uploading (${uploadProgress}%)` 
                : !hasCompletedAssessment && !loadingAssessment
                  ? 'Learning Style Assessment Required'
                  : selectedFiles.length > 1 
                    ? `Upload ${selectedFiles.length} Documents` 
                    : 'Upload Document'
              }
            </Button>
          </DialogActions>
        ) :
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={(selectedFiles.length === 0 || isUploading || (!hasCompletedAssessment && !loadingAssessment))}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              py: 1.5,
              width: '100%',
              bgcolor: '#5e6edc', 
              '&:hover': { bgcolor: '#4a5dc7' },
              borderRadius: 1
            }}
          >
            {isUploading 
              ? `Uploading (${uploadProgress}%)` 
              : !hasCompletedAssessment && !loadingAssessment
                ? 'Learning Style Assessment Required'
                : selectedFiles.length > 1 
                  ? `Upload ${selectedFiles.length} Documents` 
                  : 'Upload Document'
            }
          </Button>
        }
      </Paper>
    </Box>
  );
};

export default DocumentUpload; 