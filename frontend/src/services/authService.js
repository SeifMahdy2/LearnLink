import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Create a Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Session start time tracking
let sessionStartTime = null;

// Register a new user with email and password
export const registerWithEmailAndPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile with displayName
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Save user to Firestore
    await saveUserToFirestore(userCredential.user, 'email');
    
    // Start tracking session time
    startSessionTimer();
    
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update login streak after successful login
    try {
      await updateLoginStreak(email);
    } catch (error) {
      console.error("Error updating login streak:", error.message);
      // Don't let streak updating error affect the login flow
    }
    
    // Start tracking session time
    startSessionTimer();
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error.message);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save user to Firestore
    await saveUserToFirestore(user, 'google');
    
    // Update login streak after successful login
    try {
      await updateLoginStreak(user.email);
    } catch (error) {
      console.error("Error updating login streak:", error.message);
      // Don't let streak updating error affect the login flow
    }
    
    // Start tracking session time
    startSessionTimer();
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
    throw error;
  }
};

// Sign out
export const logoutUser = async () => {
  try {
    // Record session time before logging out
    await recordSessionTime();
    
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error resetting password:", error.message);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user && sessionStartTime) {
      // User logged out or session expired, record time
      recordSessionTime().catch(error => {
        console.error("Error recording session time on auth state change:", error);
      });
    } else if (user && !sessionStartTime) {
      // User logged in, start timer
      startSessionTimer();
    }
    callback(user);
  });
};

// Record session time
export const recordSessionTime = async () => {
  if (!sessionStartTime) {
    // Try to recover from localStorage
    const savedStartTime = localStorage.getItem('sessionStartTime');
    if (savedStartTime) {
      sessionStartTime = new Date(savedStartTime);
    } else {
      console.log("No session to record");
      return;
    }
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    console.log("No user logged in, can't record time");
    sessionStartTime = null;
    localStorage.removeItem('sessionStartTime');
    return;
  }
  
  const endTime = new Date();
  const sessionDurationMs = endTime - sessionStartTime;
  const sessionMinutes = Math.round(sessionDurationMs / (1000 * 60));
  
  console.log(`Session duration: ${sessionMinutes} minutes`);
  
  try {
    const response = await fetch('http://localhost:5000/api/user/record-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email,
        durationMinutes: sessionMinutes,
        sessionStart: sessionStartTime.toISOString(),
        sessionEnd: endTime.toISOString(),
        activityType: 'session'
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error recording session time: ${response.status}`);
    }
    
    // Reset timer
    sessionStartTime = null;
    localStorage.removeItem('sessionStartTime');
    
    return await response.json();
  } catch (error) {
    console.error("Error recording session time:", error);
    // Don't reset sessionStartTime on error to allow retry
    throw error;
  }
};

// Get weekly time statistics
export const getWeeklyTimeStats = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated user");
    }
    
    const response = await fetch('http://localhost:5000/api/user/weekly-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error fetching weekly stats: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    throw error;
  }
};

// Record specific activity time
export const recordActivityTime = async (activityType, durationMinutes) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      console.log("No user logged in, can't record activity time");
      return null;
    }
    
    const response = await fetch('http://localhost:5000/api/user/record-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email,
        durationMinutes: durationMinutes,
        activityType: activityType
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error recording activity time: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error recording ${activityType} time:`, error);
    throw error;
  }
};

// Save user to Firestore
const saveUserToFirestore = async (user, authProvider) => {
  if (!user) return;
  
  try {
    const { displayName, email, uid, photoURL } = user;
    
    try {
      // Check if user exists in Firestore
      const response = await fetch('http://localhost:5000/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check user: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.exists) {
        // Create new user document in Firestore
        const signupResponse = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: displayName || email.split('@')[0],
            email: email,
            authProvider: authProvider,
            uid: uid,
            photoURL: photoURL || '',
            createdAt: new Date().toISOString()
          }),
          credentials: 'include'
        });
        
        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          throw new Error(`Failed to save user to Firestore: ${errorData.error || signupResponse.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      
      // Check if this is a connection error (backend server not available)
      if (error.message && (
        error.message.includes("Failed to fetch") || 
        error.message.includes("NetworkError") ||
        error.message.includes("Network Error") ||
        error.message.includes("ERR_CONNECTION_REFUSED")
      )) {
        console.warn("Backend server unavailable. Authentication will proceed, but user data will not be stored in Firestore.");
        // Don't throw error, allow auth to proceed even without Firestore
        return;
      }
      
      // For other errors, throw to stop the auth flow
      throw error;
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    // Don't throw the error to prevent stopping the auth flow
    // Just log it and continue with auth
  }
};

// Update login streak
export const updateLoginStreak = async (email) => {
  try {
    const response = await fetch('http://localhost:5000/api/user/login-streak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error updating login streak: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating login streak:", error);
    throw error;
  }
};

// Start session timer
const startSessionTimer = () => {
  sessionStartTime = new Date();
  
  // Store session start time in localStorage as backup
  localStorage.setItem('sessionStartTime', sessionStartTime.toISOString());
  
  console.log("Session timer started:", sessionStartTime);
};

// Get user's total and weekly time statistics
export const getUserLearningTime = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return { success: false, error: "User not authenticated" };
    }
    
    // Get total time stats
    const timeStatsResponse = await fetch('http://localhost:5000/api/user/time-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email
      }),
      credentials: 'include'
    });
    
    if (!timeStatsResponse.ok) {
      throw new Error(`Error fetching time stats: ${timeStatsResponse.status}`);
    }
    
    const timeStats = await timeStatsResponse.json();
    
    // Get current week time
    const weekTimeResponse = await fetch('http://localhost:5000/api/user/current-week-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email
      }),
      credentials: 'include'
    });
    
    if (!weekTimeResponse.ok) {
      throw new Error(`Error fetching week time: ${weekTimeResponse.status}`);
    }
    
    const weekTime = await weekTimeResponse.json();
    
    return {
      success: true,
      totalTimeSpent: timeStats.totalTimeSpent || 0,
      currentWeekTime: weekTime.currentWeekTime || 0,
      isNewWeek: weekTime.isNewWeek,
      currentWeekKey: weekTime.currentWeekKey,
      lastWeekTracked: timeStats.lastWeekTracked,
      dailyTime: timeStats.dailyTime || [],
      recentSessions: timeStats.recentSessions || []
    };
  } catch (error) {
    console.error("Error getting user learning time:", error);
    return { success: false, error: error.message };
  }
};

// Get user's current week time only
export const getCurrentWeekTime = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return { success: false, error: "User not authenticated" };
    }
    
    const response = await fetch('http://localhost:5000/api/user/current-week-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching current week time: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting current week time:", error);
    return { success: false, error: error.message };
  }
};

// Get user's learning style data
export const getUserLearningStyle = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return { success: false, error: "User not authenticated" };
    }
    
    const response = await fetch('http://localhost:5000/api/user/learning-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching learning style: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting user learning style:", error);
    return { 
      success: false, 
      error: error.message,
      // Return a default learning style to prevent UI errors
      primaryStyle: 'Visual',
      styles: [
        { name: 'Visual', percentage: 25 },
        { name: 'Auditory', percentage: 25 },
        { name: 'Reading/Writing', percentage: 25 },
        { name: 'Kinesthetic', percentage: 25 }
      ]
    };
  }
}; 