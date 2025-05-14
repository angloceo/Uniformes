
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace these with your actual Firebase project configuration
/*const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your API key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your Auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your App ID
};*/
const firebaseConfig = {
  apiKey: "AIzaSyC7YTri8t5CySE0TckGRXo1mQVJM-IHpWQ",
  authDomain: "uniformtrack.firebaseapp.com",
  projectId: "uniformtrack",
  storageBucket: "uniformtrack.firebasestorage.app",
  messagingSenderId: "984182459483",
  appId: "1:984182459483:web:199fbfd9f9f6821c3d837e"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
