// src/services/firebase.js

// src/services/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth }     from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAvZBXjZjTp9xVUI8Bkfux5vU_fkm6XJD4",
  authDomain: "payme-c37f6.firebaseapp.com",
  databaseURL: "https://payme-c37f6-default-rtdb.firebaseio.com",
  projectId: "payme-c37f6",
  storageBucket: "payme-c37f6.appspot.com",
  messagingSenderId: "68338935216",
  appId: "1:68338935216:web:a07200e5a1931e2dcee275"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth     = getAuth(app);
export const database = getDatabase(app);
