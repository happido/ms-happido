import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoHvQ645sr7uITHzhDg0UFSKeFhseKAWM",
  authDomain: "ms-happido.firebaseapp.com",
  projectId: "ms-happido",
  storageBucket: "ms-happido.firebasestorage.app",
  messagingSenderId: "472309736562",
  appId: "1:472309736562:web:8c7ea87b2c03ff0b710eeb",
  measurementId: "G-R6927FGYQX"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
