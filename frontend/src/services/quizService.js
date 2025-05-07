import { getCurrentUser } from './authService';

// API endpoint base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Save a quiz score to the user's profile
 * @param {Object} quizData - Quiz data including score, quiz name, etc.
 * @returns {Promise} - Promise resolving to the result of the save operation
 */
export const saveQuizScore = async (quizData) => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.error('No authenticated user found');
      return { success: false, error: 'User not authenticated' };
    }
    
    // Prepare data for the API
    const data = {
      email: currentUser.email,
      uid: currentUser.uid,
      name: currentUser.displayName,
      quizId: quizData.quizId || `quiz_${Date.now()}`,
      quizName: quizData.quizName || 'Quiz',
      score: quizData.score,
      correctAnswers: quizData.correctAnswers,
      totalQuestions: quizData.totalQuestions,
      percentage: quizData.percentage,
      documentId: quizData.documentId
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/api/store-quiz-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to save quiz score:', result.error);
      return { success: false, error: result.error || 'Failed to save quiz score' };
    }
    
    return { success: true, message: result.message || 'Quiz score saved successfully' };
  } catch (error) {
    console.error('Error saving quiz score:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while saving the quiz score' 
    };
  }
};

/**
 * Get quiz scores for the current user
 * @returns {Promise} - Promise resolving to the user's quiz scores
 */
export const getUserQuizScores = async () => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.error('No authenticated user found');
      return { success: false, error: 'User not authenticated', quizScores: [] };
    }
    
    // Make API request to get user's quiz scores
    const response = await fetch(`${API_BASE_URL}/api/user/quiz-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email,
        uid: currentUser.uid
      }),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to get quiz scores:', result.error);
      return { 
        success: false, 
        error: result.error || 'Failed to get quiz scores',
        quizScores: [] 
      };
    }
    
    return { 
      success: true, 
      quizScores: result.quizScores || [] 
    };
  } catch (error) {
    console.error('Error getting quiz scores:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while getting quiz scores',
      quizScores: [] 
    };
  }
}; 