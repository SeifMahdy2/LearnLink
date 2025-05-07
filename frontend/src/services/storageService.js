import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Get user files from Firestore
export const getUserFiles = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files?userId=${userId}`);
    
    // Check if the response has the expected structure
    if (response.data && response.data.success && Array.isArray(response.data.files)) {
      return response.data.files;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error getting user files:', error);
    return [];
  }
};

// Delete file metadata from Firestore
export const deleteFile = async (fileId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Upload a file using the backend API
export const uploadFile = async (file, learningStyle = 'visual') => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to upload files');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.uid);
    formData.append('learningStyle', learningStyle);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get virtual file URL (no actual file stored)
export const getFileUrl = async (fileId) => {
  try {
    if (!fileId) {
      return { url: '', error: 'No fileId provided' };
    }

    const response = await axios.get(`${API_BASE_URL}/files/${fileId}/url`);
    return {
      url: response.data.downloadUrl,
      name: response.data.name,
    };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { url: '', error: error.message };
  }
};

export const processDocument = async (fileId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/files/${fileId}/process`);
    return response.data;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

export const downloadProcessedDocument = async (fileId, format = 'pdf') => {
  try {
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/download/${fileId}/${format}`;
    link.setAttribute('download', `processed_document.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading processed document:', error);
    throw error;
  }
}; 