import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Menu,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Tab,
  Tabs,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
  Grid,
  Snackbar
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Description as DocIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CloudOff as NoDocumentsIcon,
  FormatListBulleted as ListIcon,
  Psychology as PsychologyIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  Slideshow as SlideshowIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon,
  TextSnippet as TextSnippetIcon,
  FolderZip as FolderZipIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  Hearing as HearingIcon,
  MenuBook as MenuBookIcon,
  AccessibilityNew as AccessibilityNewIcon,
  VisibilityOutlined as VisibilityIcon,
  Sync as SyncIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { deleteFile, getUserFiles, processDocument, downloadProcessedDocument, API_BASE_URL } from '../services/fileService';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';
import DocumentDialog from './DocumentDialog';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import firebase from 'firebase/compat/app';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 3, 
          height: '100%', 
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
          borderRadius: '0 0 16px 16px',
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Date 
    ? timestamp 
    : new Date(timestamp);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get file type label
const getFileTypeLabel = (fileType) => {
  if (!fileType) return 'Unknown';
  
  if (fileType.includes('pdf')) {
    return 'PDF';
  } else if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) {
    return 'Presentation';
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('xls')) {
    return 'Spreadsheet';
  } else if (fileType.includes('word') || fileType.includes('document') || fileType.includes('doc')) {
    return 'Document';
  } else if (fileType.includes('image')) {
    return 'Image';
  } else if (fileType.includes('audio')) {
    return 'Audio';
  } else if (fileType.includes('video')) {
    return 'Video';
  } else if (fileType.includes('text')) {
    return 'Text';
  } else if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) {
    return 'Archive';
  } else {
    // Extract extension from MIME type
    const parts = fileType.split('/');
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
    return 'File';
  }
};

const getFileIcon = (fileType, fileName = '') => {
  // Check file extension from name first
  const extension = fileName.split('.').pop().toLowerCase();
  
  // First try to match by extension
  if (extension) {
    // Document files
    if (['pdf'].includes(extension)) {
      return <PictureAsPdfIcon sx={{ color: '#e53935' }} />;
    } else if (['ppt', 'pptx', 'pps', 'ppsx'].includes(extension)) {
      return <SlideshowIcon sx={{ color: '#d14836' }} />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <TableChartIcon sx={{ color: '#0f9d58' }} />;
    } else if (['doc', 'docx', 'rtf'].includes(extension)) {
      return <DescriptionOutlinedIcon sx={{ color: '#4285f4' }} />;
    }
    // Media files
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return <ImageIcon sx={{ color: '#673ab7' }} />;
    } else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
      return <AudioIcon sx={{ color: '#ff9800' }} />;
    } else if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv'].includes(extension)) {
      return <VideoIcon sx={{ color: '#f44336' }} />;
    }
    // Other files
    else if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(extension)) {
      return <TextSnippetIcon sx={{ color: '#607d8b' }} />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <FolderZipIcon sx={{ color: '#795548' }} />;
    }
  }
  
  // Fallback to MIME type checking if extension doesn't match
  if (!fileType) return <DescriptionOutlinedIcon />;

  if (fileType.includes('pdf')) {
    return <PictureAsPdfIcon sx={{ color: '#e53935' }} />;
  } else if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) {
    return <SlideshowIcon sx={{ color: '#d14836' }} />;
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('xls')) {
    return <TableChartIcon sx={{ color: '#0f9d58' }} />;
  } else if (fileType.includes('word') || fileType.includes('document') || fileType.includes('doc')) {
    return <DescriptionOutlinedIcon sx={{ color: '#4285f4' }} />;
  } else if (fileType.includes('image')) {
    return <ImageIcon sx={{ color: '#673ab7' }} />;
  } else if (fileType.includes('audio')) {
    return <AudioIcon sx={{ color: '#ff9800' }} />;
  } else if (fileType.includes('video')) {
    return <VideoIcon sx={{ color: '#f44336' }} />;
  } else if (fileType.includes('text')) {
    return <TextSnippetIcon sx={{ color: '#607d8b' }} />;
  } else if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) {
    return <FolderZipIcon sx={{ color: '#795548' }} />;
  } else {
    return <FileIcon sx={{ color: '#607d8b' }} />;
  }
};

const FileCard = ({ file, onPreview, onProcess, onDelete, onStyleChange, theme }) => {
  const history = useHistory();
  
  // Handler for card click to navigate to document processing page
  const handleCardClick = () => {
    history.push(`/process/${file.id}`, {
      documentName: file.name,
      learningStyle: file.learningStyle
    });
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'processed':
        return theme.palette.success.main;
      case 'processing':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getLearningStyleLabel = (style) => {
    if (!style) return '';
    
    switch(style) {
      case 'visual':
        return 'Visual';
      case 'auditory':
        return 'Auditory';
      case 'reading_writing':
        return 'Reading';
      case 'kinesthetic':
        return 'Kinesthetic';
      default:
        return '';
    }
  };
  
  return (
    <ListItem 
      disablePadding
      onClick={handleCardClick}
      sx={{ 
        mb: 1.5, 
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 3px 5px rgba(0,0,0,0.2)' 
          : '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'all 0.25s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 5px 10px rgba(0,0,0,0.35)' 
            : '0 4px 8px rgba(0,0,0,0.15)',
          transform: 'translateY(-3px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.01)'
        },
        borderLeft: file.learningStyle 
          ? `3px solid ${theme.palette.primary.main}`
          : `3px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          p: 1.5
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 40,
            height: 40,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.06)' 
              : 'rgba(0, 0, 0, 0.03)',
            borderRadius: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getFileIcon(file.type, file.name)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {file.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mr: 1.5 }}
            >
              {formatFileSize(file.size)}
            </Typography>
            
            {file.learningStyle && (
              <>
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                    mr: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    opacity: 0.85
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      display: 'inline-block',
                      mr: 0.5
                    }}
                  />
                  {getLearningStyleLabel(file.learningStyle)}
                </Box>
              </>
            )}

            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              {formatDate(file.createdAt)}
            </Typography>
          </Box>
        </Box>
      
        {/* Action buttons */}
        <Box sx={{ 
          display: 'flex',
          gap: 1
        }}>
          <Tooltip title="Process Document">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onProcess(file.id);
              }}
              sx={{ 
                color: theme.palette.primary.main,
                padding: 0.5,
                width: 30,
                height: 30,
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(25, 118, 210, 0.18)' 
                    : 'rgba(25, 118, 210, 0.12)',
                }
              }}
            >
              <SyncIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${API_BASE_URL}/files/${file.id}/download`, '_blank');
              }}
              sx={{ 
                padding: 0.5,
                width: 30, 
                height: 30,
                borderRadius: 1.5,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(25, 118, 210, 0.18)' 
                    : 'rgba(25, 118, 210, 0.12)',
                }
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Learning Style">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onStyleChange(file);
              }}
              sx={{ 
                padding: 0.5,
                width: 30,
                height: 30,
                borderRadius: 1.5,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(25, 118, 210, 0.18)' 
                    : 'rgba(25, 118, 210, 0.12)',
                }
              }}
            >
              <PsychologyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id);
              }}
              sx={{ 
                color: theme.palette.error.main,
                padding: 0.5,
                width: 30,
                height: 30,
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(244, 67, 54, 0.18)'
                    : 'rgba(244, 67, 54, 0.12)'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </ListItem>
  );
};

const MyDocuments = () => {
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const [allDocuments, setAllDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [processingDocId, setProcessingDocId] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);
  const [selectedStyleFile, setSelectedStyleFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const learningStyles = [
    { value: 'visual', label: 'Visual', icon: <VisibilityIcon /> },
    { value: 'auditory', label: 'Auditory', icon: <HearingIcon /> },
    { value: 'reading_writing', label: 'Reading/Writing', icon: <MenuBookIcon /> },
    { value: 'kinesthetic', label: 'Kinesthetic', icon: <AccessibilityNewIcon /> }
  ];
  const history = useHistory();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Menu states
  const isMenuOpen = Boolean(menuAnchorEl);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDocuments(allDocuments);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allDocuments.filter(file => 
        file.name.toLowerCase().includes(term)
      );
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, allDocuments]);

  const fetchDocuments = async () => {
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view your documents');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const userFiles = await getUserFiles(currentUser.uid);
      
      // Ensure we have an array to work with
      if (!Array.isArray(userFiles)) {
        console.error('Invalid response format:', userFiles);
        setAllDocuments([]);
        setFilteredDocuments([]);
        setError('Unexpected data format received from server. Please contact support.');
        return;
      }
      
      // Sort by date (newest first)
      const sortedDocs = userFiles.sort((a, b) => {
        // Handle missing dates
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setAllDocuments(sortedDocs);
      setFilteredDocuments(sortedDocs);
      
      if (sortedDocs.length === 0) {
        setError('No documents found. Upload a document to get started.');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load your documents. Please try again later.');
      setAllDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, docId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedDocId(docId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewDocument = (docId) => {
    history.push(`/process/${docId}`);
    handleMenuClose();
  };
  
  const handleProcessDocument = async (docId) => {
    const document = allDocuments.find(doc => doc.id === docId);
    history.push(`/process/${docId}`, {
      documentName: document?.name,
      learningStyle: document?.learningStyle
    });
  };
  
  const handleDownloadProcessed = async (docId, format = 'pdf') => {
    handleMenuClose();
    
    try {
      await downloadProcessedDocument(docId, format);
    } catch (error) {
      console.error('Error downloading processed document:', error);
    }
  };
  
  const confirmDeleteDocument = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };
  
  const handleDeleteDocument = async () => {
    if (!selectedDocId) return;
    
    try {
      await deleteFile(selectedDocId);
      
      // Remove document from both document lists
      setAllDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocId));
      setFilteredDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocId));
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
  
  const closeDeleteDialog = () => {
    setConfirmDeleteOpen(false);
  };
  
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle document click for full document dialog with tabs
  const handleDocumentClick = (document) => {
    history.push(`/process/${document.id}`, {
      documentName: document.name,
      learningStyle: document.learningStyle
    });
  };

  // We'll replace the preview function with a simple download function
  const handlePreviewClick = (file) => {
    if (!file) {
      console.error('No file provided for download');
      setSnackbarMessage('Error: No file data available to download');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = `${API_BASE_URL}/files/${file.id}/download`;
      downloadLink.setAttribute('download', file.name || `document-${file.id}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Show success message
      setSnackbarMessage(`Downloading ${file.name}...`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      setSnackbarMessage(`Error downloading document: ${error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle upload complete
  const handleUploadComplete = (fileIds) => {
    // Refresh documents after upload
    fetchDocuments();
    
    // Get number of files uploaded
    const fileCount = Array.isArray(fileIds) ? fileIds.length : 1;
    
    // Show success message
    setSnackbarMessage(
      fileCount > 1 
        ? `${fileCount} documents uploaded successfully!` 
        : 'Document uploaded successfully!'
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleStyleEditClick = (event, file) => {
    event.stopPropagation();
    setSelectedStyleFile(file);
    setStyleDialogOpen(true);
  };

  const handleStyleChange = async (fileId, newStyle) => {
    if (!fileId || !newStyle) {
      console.error('Missing fileId or newStyle:', { fileId, newStyle });
      setSnackbarMessage('Error: Missing file ID or learning style');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Updating learning style for file:', fileId, 'to:', newStyle);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Use the PATCH endpoint
      const response = await axios.patch(`${API_URL}/api/files/${fileId}`, {
        learningStyle: newStyle
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response from server:', response.data);

      if (response.data.success) {
        // Update the file in both document states
        setAllDocuments(prevFiles => 
          prevFiles.map(file => 
            file.id === fileId ? { ...file, learningStyle: newStyle } : file
          )
        );
        
        setFilteredDocuments(prevFiles => 
          prevFiles.map(file => 
            file.id === fileId ? { ...file, learningStyle: newStyle } : file
          )
        );
        
        // Update selected document if it's the one being edited
        if (selectedDocument && selectedDocument.id === fileId) {
          setSelectedDocument(prev => ({ ...prev, learningStyle: newStyle }));
        }
        
        // Show success message
        setSnackbarMessage('Learning style updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Close the dialog after a brief delay to show the updated button state
        setTimeout(() => {
          setStyleDialogOpen(false);
        }, 500);
      } else {
        throw new Error(response.data.error || 'Failed to update learning style');
      }
    } catch (error) {
      console.error('Error updating learning style:', error);
      setSnackbarMessage(`Error updating learning style: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Replace the openStyleDialog function with a corrected version
  const openStyleDialog = (file) => {
    if (!file) {
      console.error('No file provided to openStyleDialog');
      return;
    }
    console.log('Opening style dialog for file:', file);
    setSelectedStyleFile(file);
    setStyleDialogOpen(true);
  };

  // Document preview dialog
  const documentPreviewDialog = (
    <Dialog
      open={documentPreviewOpen}
      onClose={() => setDocumentPreviewOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 1,
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          height: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        p: 2
      }}>
        <Typography variant="h6" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedDocument?.name || 'Document Preview'}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setDocumentPreviewOpen(false)}
          sx={{ 
            color: theme.palette.text.secondary,
            width: 28,
            height: 28,
            borderRadius: 1
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 'calc(100% - 56px)' }}>
        {selectedDocument && (
          <DocumentViewer 
            match={{ params: { fileId: selectedDocument.id } }} 
            mode="preview" 
            isDialog={true} 
          />
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f7fa', 
      minHeight: '100vh',
      pt: 0,
      pb: 0,
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100%'
    }}>
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 3, 
          minHeight: 'calc(100vh - 64px)', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%'
        }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DocIcon sx={{ 
              fontSize: 38, 
              color: theme.palette.primary.main, 
              mr: 2,
              p: 1, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
              borderRadius: 2
            }} />
          <Box>
              <Typography variant="h5" component="h1" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
              Your Learning Documents
            </Typography>
              <Typography variant="body2" color="text.secondary">
              Upload, manage, and process your learning materials
            </Typography>
          </Box>
        </Box>
          
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: theme.shadows[3],
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Upload New Document
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3, 
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 16px 0px',
            bgcolor: theme.palette.background.paper,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', 
            width: '100%',
            maxWidth: '100%'
          }}>
          <Box sx={{ 
            px: 3, 
            py: 1.5, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" fontWeight={600}>
              Your Documents
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => fetchDocuments()}
            sx={{ 
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.05)',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              <SyncIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                variant="outlined"
              placeholder="Search documents..."
                value={searchTerm}
                onChange={handleSearchChange}
              size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>

          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            pt: 1, 
            px: 2, 
            pb: 2,
            maxHeight: 'calc(100vh - 250px)' // Limit maximum height to fit in viewport
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            ) : filteredDocuments.length > 0 ? (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
                style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}
              >
                <List sx={{ p: 0, width: '100%', maxWidth: '100%' }}>
                  {filteredDocuments.map((file) => (
                    <motion.div key={file.id} variants={itemVariants} style={{ width: '100%', overflow: 'hidden' }}>
                      <FileCard 
                        file={file} 
                        onPreview={handlePreviewClick} 
                        onProcess={handleProcessDocument}
                        onDelete={(id) => {
                          setSelectedDocId(id);
                          setConfirmDeleteOpen(true);
                        }}
                        onStyleChange={(file) => {
                          setSelectedStyleFile(file);
                          setStyleDialogOpen(true);
                        }}
                        theme={theme}
                      />
                      </motion.div>
                    ))}
                  </List>
          </motion.div>
            ) : (
            <Box 
              sx={{ 
                  py: 8, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  justifyContent: 'center'
                }}
              >
                {searchTerm ? (
                  <>
                    <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h6" gutterBottom>
                      No Documents Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      No documents match your search term "{searchTerm}"
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSearchTerm('')}
                      sx={{ 
                        borderRadius: 8,
                        px: 3,
                        borderColor: theme.palette.primary.main, 
                        color: theme.palette.primary.main 
                      }}
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <NoDocumentsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h6" gutterBottom>
                      No Documents Found
                    </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your first document to get started
              </Typography>
              <Button 
                variant="contained" 
                      startIcon={<UploadIcon />}
                      onClick={handleUploadClick}
                      sx={{ 
                        borderRadius: 8,
                        px: 3,
                        backgroundColor: theme.palette.primary.main, 
                        '&:hover': { backgroundColor: theme.palette.primary.dark } 
                      }}
                    >
                      Upload Document
                    </Button>
                  </>
                )}
                      </Box>
            )}
              </Box>
        </Paper>

        {/* Learning Style Dialog */}
        <Dialog
          open={styleDialogOpen}
          onClose={() => setStyleDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { 
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
                : '0 4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 1400,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                  color: theme.palette.primary.main,
                  mr: 2
                }}
              >
                <EditIcon />
              </Avatar>
              <Typography variant="h6">Choose Learning Style</Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the learning style that best matches your preferences for this document. This will help optimize AI processing for your needs.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {learningStyles.map(style => (
                <Button
                  key={style.value}
                  variant={selectedStyleFile?.learningStyle === style.value ? "contained" : "outlined"}
                  onClick={() => handleStyleChange(selectedStyleFile?.id, style.value)}
                  fullWidth
                  startIcon={style.icon}
                  disabled={loading}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 1.75,
                    borderRadius: 2,
                    boxShadow: 'none',
                    backgroundColor: selectedStyleFile?.learningStyle === style.value 
                      ? theme.palette.primary.main 
                      : 'transparent',
                    '&:hover': { 
                      backgroundColor: selectedStyleFile?.learningStyle === style.value 
                        ? theme.palette.primary.dark 
                        : theme.palette.action.hover,
                      boxShadow: 'none'
                    },
                    color: selectedStyleFile?.learningStyle === style.value 
                      ? '#fff' 
                      : theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body1" fontWeight={500}>
                  {style.label}
                    </Typography>
                    <Typography variant="caption" color={selectedStyleFile?.learningStyle === style.value ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                      {(() => {
                        switch(style.value) {
                          case 'visual': return 'Learn best with images and visual information';
                          case 'auditory': return 'Prefer listening and speaking for learning';
                          case 'reading_writing': return 'Learn through reading and writing text';
                          case 'kinesthetic': return 'Learn by doing physical activities';
                          default: return '';
                        }
                      })()}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={() => setStyleDialogOpen(false)}
              variant="outlined"
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                mr: 1,
                px: 2
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Get the currently selected style
                const currentStyle = selectedStyleFile?.learningStyle;
                // Only apply if there's a selected file and style
                if (selectedStyleFile && currentStyle) {
                  handleStyleChange(selectedStyleFile.id, currentStyle);
                } else {
                  setStyleDialogOpen(false);
                }
              }}
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ borderRadius: 2, px: 2 }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Document Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleViewDocument(selectedDocId)}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View Document
          </MenuItem>
          
          <MenuItem onClick={() => handleProcessDocument(selectedDocId)}>
            <PsychologyIcon fontSize="small" sx={{ mr: 1 }} />
            Process Document
          </MenuItem>
          
          <MenuItem onClick={() => handleDownloadProcessed(selectedDocId, 'pdf')}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Download as PDF
          </MenuItem>
          
          <MenuItem onClick={() => handleDownloadProcessed(selectedDocId, 'docx')}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Download as DOCX
          </MenuItem>
          
          <MenuItem onClick={confirmDeleteDocument} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Document
          </MenuItem>
        </Menu>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmDeleteOpen}
          onClose={closeDeleteDialog}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteDocument} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ mb: 3 }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity} 
            variant="filled"
            elevation={6}
            sx={{ 
              width: '100%', 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.25rem'
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Document Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            px: 3, 
            pt: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6">Upload New Document</Typography>
            <IconButton
              aria-label="close"
              onClick={() => setUploadDialogOpen(false)}
              sx={{ 
                color: theme.palette.grey[500],
                width: 28,
                height: 28,
                borderRadius: 1,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <DocumentUpload 
              isDialog={true} 
              onClose={() => setUploadDialogOpen(false)} 
              onUploadComplete={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>
    </Container>
    </Box>
  );
};

export default MyDocuments; 