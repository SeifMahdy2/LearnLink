// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6FCxGRAJhyBA7jqDkVRGFte2NlsKaNkg",
  authDomain: "grad-project32.firebaseapp.com",
  projectId: "grad-project32",
  storageBucket: "grad-project32.firebasestorage.app",
  messagingSenderId: "320152005037",
  appId: "1:320152005037:web:2e64b986b45f408f80d924",
  measurementId: "G-XGBQMHD74F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth with in-memory persistence to prevent persistent login
export const auth = getAuth(app);

// Set auth to in-memory only - user will be logged out when the page is refreshed or closed
setPersistence(auth, inMemoryPersistence)
  .then(() => {
    console.log("Authentication persistence set to IN-MEMORY ONLY - user will need to login each time");
  })
  .catch((error) => {
    console.error("Error setting authentication persistence:", error);
  });

export const db = getFirestore(app);
export const storage = getStorage(app); 