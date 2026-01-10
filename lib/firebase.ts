// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDhwslt54Wd5gTm_3ea78dJOyh9IYEYSgM",
    authDomain: "bus-tracking-6fcb5.firebaseapp.com",
    projectId: "bus-tracking-6fcb5",
    storageBucket: "bus-tracking-6fcb5.firebasestorage.app",
    messagingSenderId: "167014370332",
    appId: "1:167014370332:web:f434f883b9e651dc91e3d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
