import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9KrdDZQEYX75fJ5uDJkay_zz89ISFE6M",
  authDomain: "memory-card-game-bd2e9.firebaseapp.com",
  projectId: "memory-card-game-bd2e9",
  storageBucket: "memory-card-game-bd2e9.firebasestorage.app",
  messagingSenderId: "928672949157",
  appId: "1:928672949157:web:fbaa8fe8e948caf4a93e4c",
  measurementId: "G-C11FQ2SRQQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);