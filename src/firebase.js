import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfjf4aJG9WnHrr0KbTyMX-UJYA658XHks",
  authDomain: "scoop-logger.firebaseapp.com",
  projectId: "scoop-logger",
  storageBucket: "scoop-logger.firebasestorage.app",
  messagingSenderId: "503931309386",
  appId: "1:503931309386:web:893ef061c68749dd5c85b3",
  measurementId: "G-S8V2L95E0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
