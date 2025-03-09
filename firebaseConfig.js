import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCE5aJVJRpOl0SPg5UelC5tZSbqyAz9yHA",
    authDomain: "glowgirl-d697f.firebaseapp.com",
    projectId: "glowgirl-d697f",
    storageBucket: "glowgirl-d697f.firebasestorage.app",
    messagingSenderId: "579490001119",
    appId: "1:579490001119:web:56660d28edb8e0ac24796a",
    measurementId: "G-BRMQSWV87H"
};

// Function to get the current user's ID token
const getCurrentUserToken = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true);
        return token;
      } catch (error) {
        console.error("Error getting ID token:", error);
      }
    } else {
      console.warn("No user is currently signed in.");
      return null;
    }
  };

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth, getCurrentUserToken }; // Export the auth instance
