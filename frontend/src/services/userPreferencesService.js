import axios from 'axios';
import { getAuth } from 'firebase/auth';

// API endpoint base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Get the current user's default learning style preference
 * @returns {Promise<Object>} Default learning style data
 */
export const getDefaultLearningStyle = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${user.uid}/preferences/learning-style`);
    return response.data;
  } catch (error) {
    console.error('Error getting default learning style:', error);
    // Return a default value if not yet set
    return {
      success: false,
      defaultStyle: 'visual',
      error: error.message
    };
  }
};

/**
 * Set the user's default learning style preference
 * @param {string} learningStyle - The preferred learning style (visual, auditory, reading_writing, or kinesthetic)
 * @returns {Promise<Object>} Response data
 */
export const setDefaultLearningStyle = async (learningStyle) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.post(`${API_BASE_URL}/users/${user.uid}/preferences/learning-style`, {
      defaultStyle: learningStyle
    });
    
    return response.data;
  } catch (error) {
    console.error('Error setting default learning style:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get the user's subject-specific learning style preferences
 * @returns {Promise<Object>} Subject preferences data
 */
export const getSubjectPreferences = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${user.uid}/preferences/subjects`);
    return response.data;
  } catch (error) {
    console.error('Error getting subject preferences:', error);
    return {
      success: false,
      subjects: [],
      error: error.message
    };
  }
};

/**
 * Set a subject-specific learning style preference
 * @param {string} subject - The subject name
 * @param {string} learningStyle - The preferred learning style for this subject
 * @returns {Promise<Object>} Response data
 */
export const setSubjectPreference = async (subject, learningStyle) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.post(`${API_BASE_URL}/users/${user.uid}/preferences/subjects`, {
      subject,
      learningStyle
    });
    
    return response.data;
  } catch (error) {
    console.error('Error setting subject preference:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a subject-specific learning style preference
 * @param {string} subject - The subject name to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteSubjectPreference = async (subject) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.delete(`${API_BASE_URL}/users/${user.uid}/preferences/subjects/${encodeURIComponent(subject)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting subject preference:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Track learning style effectiveness based on quiz results
 * @param {string} quizId - The ID of the completed quiz
 * @param {string} documentId - The ID of the document the quiz is based on
 * @param {string} learningStyle - The learning style used for this document
 * @param {number} score - The quiz score (percentage)
 * @returns {Promise<Object>} Response data
 */
export const trackLearningStyleEffectiveness = async (quizId, documentId, learningStyle, score) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.post(`${API_BASE_URL}/users/${user.uid}/learning-effectiveness`, {
      quizId,
      documentId,
      learningStyle,
      score,
      timestamp: new Date().toISOString()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error tracking learning style effectiveness:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get learning style effectiveness data for the current user
 * @returns {Promise<Object>} Effectiveness data including recommendations
 */
export const getLearningEffectivenessData = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${user.uid}/learning-effectiveness`);
    return response.data;
  } catch (error) {
    console.error('Error getting learning effectiveness data:', error);
    return {
      success: false,
      styles: [],
      recommendedStyle: null,
      error: error.message
    };
  }
};

/**
 * Get learning history with styles used
 * @returns {Promise<Object>} Learning history data
 */
export const getLearningStyleHistory = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${user.uid}/learning-style-history`);
    return response.data;
  } catch (error) {
    console.error('Error getting learning style history:', error);
    return {
      success: false,
      history: [],
      error: error.message
    };
  }
}; 