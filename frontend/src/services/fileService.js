import axios from 'axios';
import { getAuth } from 'firebase/auth';

// API endpoint base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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
export const uploadFile = async (file, learningStyle) => {
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
      console.error('No fileId provided to getFileUrl');
      return { error: 'No file ID provided' };
    }
    
    console.log(`Fetching URL for file ID: ${fileId}`);
    
    // Try up to 3 times with increasing delay
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.get(`${API_BASE_URL}/files/${fileId}/url`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token if you're using one
          },
          responseType: 'json',
          timeout: 10000 // 10 second timeout
        });
        
        console.log(`API response (attempt ${attempt + 1}):`, response.data);
        
        // Direct URL in response
        if (response.data && response.data.url) {
          let url = response.data.url;
          
          // Force inline display for PDFs
          if (url.includes('alt=media')) {
            url = url.replace('alt=media', 'alt=inline');
          }
          
          return { 
            url: url,
            name: response.data.name || `Document-${fileId}`,
            type: response.data.type || 'application/pdf'
          };
        }
        // Handle response with downloadUrl field (our backend format)
        else if (response.data && response.data.downloadUrl) {
          let url = response.data.downloadUrl;
          
          // Force inline display for PDFs
          if (url.includes('alt=media')) {
            url = url.replace('alt=media', 'alt=inline');
          }
          
          return { 
            url: url,
            name: response.data.name || `Document-${fileId}`,
            type: response.data.type || 'application/pdf'
          };
        }
        // Success field in response
        else if (response.data && response.data.success) {
          let url = response.data.url || response.data.downloadUrl || response.data.fileUrl;
          
          if (!url) {
            console.error('Response missing URL field despite success=true:', response.data);
            throw new Error('File URL not found in server response');
          }
          
          // Force inline display for PDFs
          if (url.includes('alt=media')) {
            url = url.replace('alt=media', 'alt=inline');
          }
          
          return { 
            url: url,
            name: response.data.name || response.data.fileName || `Document-${fileId}`,
            type: response.data.type || response.data.fileType || 'application/pdf'
          };
        }
        // Handle direct download URL for backward compatibility
        else if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
          let url = response.data;
          
          // Force inline display for PDFs
          if (url.includes('alt=media')) {
            url = url.replace('alt=media', 'alt=inline');
          }
          
          return { 
            url: url,
            name: `Document-${fileId}`,
            type: 'application/pdf'
          };
        }
        else {
          console.error('Unexpected response format:', response.data);
          throw new Error(response.data.error || 'Failed to get file URL');
        }
      } catch (err) {
        console.warn(`Attempt ${attempt + 1} failed:`, err.message);
        lastError = err;
        
        // Only delay and retry if not the last attempt
        if (attempt < 2) {
          // Exponential backoff: 1s, 2s
          const delay = (attempt + 1) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we got here, all attempts failed
    throw lastError || new Error('Failed to get file URL after multiple attempts');
    
  } catch (error) {
    console.error('Error getting file URL:', error);
    
    // Special handling for network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error')) {
      return { error: 'Network error: Could not connect to the server. Please check your internet connection.' };
    }
    
    return { error: error.message || 'Failed to get file URL' };
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

export const generateSummary = async (fileId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/files/${fileId}/generate-summary`);
    return response.data;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const generateQuiz = async (fileId, quizType, options = {}) => {
  try {
    console.log(`Generating ${quizType} quiz for file ID ${fileId}`, options);
    const token = localStorage.getItem('token');
    
    // If no token is found, try using the authToken instead
    const authToken = token || localStorage.getItem('authToken');
    
    if (!authToken) {
      console.warn('No authentication token found. Attempting to proceed without authentication.');
    }

    const payload = {
      quiz_type: quizType,
      options: {
        ...options
      }
    };

    // Log the full request payload for debugging
    console.log('Quiz generation request payload:', payload);

    const response = await fetch(`${API_BASE_URL}/files/${fileId}/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify(payload)
    });

    // Handle HTTP error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // Try to parse the error as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `Server responded with ${response.status}: ${response.statusText}`;
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = errorText || `Server responded with ${response.status}: ${response.statusText}`;
      }
      
      console.error(`Server error when generating ${quizType} quiz:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log(`${quizType} quiz generation response:`, data);
    
    // Check if the response has the expected structure
    if (!data || (!data.quiz && !data.success)) {
      console.error(`Invalid quiz response format for ${quizType}:`, data);
      throw new Error(`Received invalid quiz data for ${quizType}`);
    }
    
    // Apply validation helpers for fill_in_blanks quiz
    if (quizType === 'fill_in_blanks' && data.quiz) {
      const questions = Array.isArray(data.quiz) ? data.quiz : (data.quiz.questions || []);
      
      // Ensure all questions have the expected structure
      const validatedQuestions = questions.map(q => {
        // Make sure we have text_before_blank and text_after_blank
        if (!q.text_before_blank && q.sentence_start) {
          q.text_before_blank = q.sentence_start;
        }
        
        if (!q.text_after_blank && q.sentence_end) {
          q.text_after_blank = q.sentence_end;
        }
        
        // If options.single_blank_only is true, ensure questions only have one blank
        if (options.single_blank_only) {
          // Replace any additional blanks in before text with the word
          if (q.text_before_blank && q.text_before_blank.includes('_____')) {
            const count = (q.text_before_blank.match(/_{5}/g) || []).length;
            if (count > 0) {
              console.log(`Found ${count} blanks in before text, fixing`);
              q.text_before_blank = q.text_before_blank.replace(/_{5}/g, '[term]');
            }
          }
          
          // Replace any additional blanks in after text
          if (q.text_after_blank && q.text_after_blank.includes('_____')) {
            const count = (q.text_after_blank.match(/_{5}/g) || []).length;
            if (count > 0) {
              console.log(`Found ${count} blanks in after text, fixing`);
              q.text_after_blank = q.text_after_blank.replace(/_{5}/g, '[term]');
            }
          }
        }
        
        return q;
      });
      
      if (Array.isArray(data.quiz)) {
        data.quiz = validatedQuestions;
      } else {
        data.quiz.questions = validatedQuestions;
      }
    }
    
    return {
      success: true,
      quiz: data.quiz || (data.success && data.questions ? data.questions : [])
    };
  } catch (error) {
    console.error(`Error generating ${quizType} quiz:`, error);
    return {
      success: false,
      error: error.message || `An unexpected error occurred while generating the ${quizType} quiz`
    };
  }
};

export const processReadingWriting = async (fileId) => {
  try {
    // Log processing start 
    console.log(`Processing reading/writing content for file: ${fileId}`);
    
    // Make sure all content is passed to the backend for file generation
    const response = await axios.post(`${API_BASE_URL}/files/${fileId}/process-reading-writing`, null, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Log response to help diagnose any issues
    console.log('Reading/writing processing response:', response.data);
    
    if (response.data && response.data.success) {
      // Make sure we're returning everything needed including document content
      return {
        success: true,
        content: response.data.content,
        docxUrl: response.data.docxUrl,
        pdfUrl: response.data.pdfUrl
      };
    } else {
      console.error('Error in reading/writing processing:', response.data?.error || 'Unknown error');
      return {
        success: false,
        error: response.data?.error || 'Failed to process reading/writing content'
      };
    }
  } catch (error) {
    console.error('Error processing reading/writing content:', error);
    throw error;
  }
};

export const processAuditory = async (fileId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/files/${fileId}/process-auditory`);
    return response.data;
  } catch (error) {
    console.error('Error processing auditory content:', error);
    throw error;
  }
};

export const processKinesthetic = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/process-kinesthetic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process kinesthetic content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing kinesthetic content:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while processing kinesthetic content'
    };
  }
};

export const processVisual = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/process-visual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process visual content');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in processVisual:', error);
    return {
      success: false,
      error: error.message || 'Failed to process visual content'
    };
  }
};

export const getVisualConcepts = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/visual-concepts?fileId=${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch visual concepts');
    }

    const data = await response.json();
    return {
      success: true,
      concepts: data
    };
  } catch (error) {
    console.error('Error fetching visual concepts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch visual concepts'
    };
  }
};

export const getImageForTopic = async (topic) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/image-for-topic`, { topic }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting image for topic:', error);
    return {
      success: false,
      error: error.message || 'Failed to get image',
      image_url: '/static/images/placeholder.png'
    };
  }
};

export const processReadingWritingConsistent = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/process-reading-writing-consistent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process document for consistent reading/writing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in processReadingWritingConsistent:', error);
    throw error;
  }
}; 