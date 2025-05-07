/**
 * Get a user-friendly message from Firebase auth error codes
 * @param {Error} error - Firebase auth error object or error code string
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  // If error is a string (error code), use it directly
  const errorCode = typeof error === 'string' 
    ? error 
    : (error.code || 'auth/unknown-error');
  
  switch (errorCode) {
    // Email/Password errors
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a mix of letters, numbers and symbols.';
    
    // Password reset errors
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/expired-action-code':
      return 'The password reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'The password reset link is invalid. It may have been used already or expired.';
    
    // Social login errors
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials. Sign in using the original account.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this website.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing the sign-in. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in request was cancelled. Please try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    
    // Network errors
    case 'auth/network-request-failed':
      return 'A network error has occurred. Please check your internet connection and try again.';
    case 'auth/timeout':
      return 'The operation has timed out. Please try again.';
    
    // Generic fallback
    case 'auth/internal-error':
    default:
      return 'An error occurred during authentication. Please try again later.';
  }
}; 