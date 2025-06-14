// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbMsyB4zAQJcnEEeliLxiLp-BsNYIdeRw",
  authDomain: "sentryai-a2629.firebaseapp.com",
  projectId: "sentryai-a2629",
  storageBucket: "sentryai-a2629.firebasestorage.app",
  messagingSenderId: "587108968305",
  appId: "1:587108968305:web:56eb7aa7885f2a289b78d0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }; 
