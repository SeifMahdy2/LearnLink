/**
 * Session management utilities to handle app close/restart/reload
 */

import { logoutUser } from '../services/authService';

// Key for storing last active timestamp in sessionStorage
const LAST_ACTIVE_KEY = 'app_last_active_timestamp';
// Key for storing last user activity timestamp
const LAST_ACTIVITY_KEY = 'app_last_user_activity';
// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Checks if this is a new browser session and updates timestamps
 * @param {Object} currentUser - The currently logged in user (if any)
 */
export const checkAndClearSession = (currentUser) => {
  try {
    // Check if this is a new browser session
    if (!sessionStorage.getItem(LAST_ACTIVE_KEY)) {
      console.log('New browser session detected');
      sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      // Start tracking activity
      updateUserActivity();
      return true; // New session
    }
    
    // Update the timestamp for this session
    sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    
    // Check for session timeout due to inactivity
    checkSessionTimeout(currentUser);
    
    return false; // Existing session
  } catch (error) {
    console.error('Error checking session state:', error);
    return false;
  }
};

/**
 * Check if the user session has timed out due to inactivity
 * @param {Object} currentUser - The currently logged in user (if any)
 */
export const checkSessionTimeout = (currentUser) => {
  if (!currentUser) return;
  
  const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  const now = Date.now();
  
  if (lastActivity) {
    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceLastActivity = now - lastActivityTime;
    
    // If inactive for more than the timeout period, log the user out
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      console.log('Session timeout due to inactivity - logging out user');
      logoutUser()
        .then(() => {
          // Reset activity trackers
          sessionStorage.removeItem(LAST_ACTIVITY_KEY);
          // Show a message and redirect to login
          alert('Your session has expired due to inactivity. Please login again.');
          window.location.href = '/login';
        })
        .catch(err => console.error('Error during timeout logout:', err));
    }
  } else {
    // Initialize last activity time
    updateUserActivity();
  }
};

/**
 * Update the user's last activity timestamp
 */
export const updateUserActivity = () => {
  sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

/**
 * Register event handlers for browser/tab close events
 */
export const registerSessionHandlers = () => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // When tab becomes visible again, update activity
      updateUserActivity();
    }
  };

  const handleBeforeUnload = () => {
    // Just update activity on unload (refresh)
    updateUserActivity();
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}; 