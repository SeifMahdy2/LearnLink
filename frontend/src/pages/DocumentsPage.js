import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Sort as SortIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const DocumentsPage = () => {
  const history = useHistory();
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Fetch documents from your API
    const mockDocuments = [
      {
        id: '1',
        name: 'Security_CW.docx',
        type: 'docx',
        size: '465.19 KB',
        status: 'Reading',
        lastModified: new Date('2024-03-24'),
        learningStyle: 'reading'
      },
      // ... other documents
    ];
    setDocuments(mockDocuments);
  }, []);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 0;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleDocumentClick = (document) => {
    history.push(`/process/${document.id}`, {
      documentName: document.name,
      learningStyle: document.learningStyle
    });
  };

  const handleMenuOpen = (event, document) => {
    event.stopPropagation();
    setSelectedDocument(document);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    // Implement delete functionality
    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reading':
        return '#2196f3';
      case 'Visual':
        return '#4caf50';
      case 'Kinesthetic':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 600,
                color: '#1a237e',
                mb: 1
              }}
            >
              Your Documents
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem'
              }}
            >
              Upload, manage and process your learning materials
            </Typography>
          </Box>

          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              bgcolor: '#3f51b5',
              '&:hover': { bgcolor: '#303f9f' },
              fontSize: '0.9rem',
              py: 1.2,
              px: 2.5,
              height: 'fit-content'
            }}
          >
            Upload Document
            <input
              type="file"
              hidden
              onChange={handleUpload}
              accept=".pdf,.doc,.docx"
            />
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 4
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: '#3f51b5',
                },
              }
            }}
          />

          <Tooltip title="Sort">
            <IconButton 
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter">
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(63, 81, 181, 0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#3f51b5'
              }
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1,
              display: 'block',
              textAlign: 'right',
              color: 'text.secondary'
            }}
          >
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Documents Grid */}
      <Grid container spacing={3}>
        {filteredDocuments.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card 
              onClick={() => handleDocumentClick(document)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="span">
                      {getFileIcon(document.type)}
                    </Typography>
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        fontWeight: 500,
                        color: '#1a237e',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px'
                      }}
                    >
                      {document.name}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, document)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={document.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(document.status)}15`,
                      color: getStatusColor(document.status),
                      fontWeight: 500
                    }}
                  />
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Size: {document.size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modified: {formatDistanceToNow(document.lastModified)} ago
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => setSortAnchorEl(null)}>Name (A-Z)</MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>Date Modified</MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>Size</MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>PDF Files</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Word Documents</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this document?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentsPage; 