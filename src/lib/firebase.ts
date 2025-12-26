
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD53I7XBV8BEIjwmw3dmu9wheL5id0awbY",
  authDomain: "departmental-internship.firebaseapp.com",
  projectId: "departmental-internship",
  storageBucket: "departmental-internship.firebasestorage.app",
  messagingSenderId: "748337963056",
  appId: "1:748337963056:web:d9d1b98623c151aa2f0df5",
  measurementId: "G-F8ZJ3WFGKP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
