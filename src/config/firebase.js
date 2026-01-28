// File: src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Mengambil config dari environment variable (Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Konstanta Global
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const APP_ID = "rfx-femmora-production"; // ID Koleksi database kamu

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function untuk AI (agar App.jsx bersih)
export const generateGeminiContent = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    if (response.status === 429) {
      return "Waduh, Rexa lagi pusing nih kebanyakan yang nanya 😵. Kuota otakku habis hari ini. Coba tanya lagi besok atau hubungi Admin manusia ya!";
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, Rexa lagi bingung mau jawab apa.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal menghubungi Rexa. Cek koneksi kamu ya.";
  }
};
