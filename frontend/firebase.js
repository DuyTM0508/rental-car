import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1PBDJzJ39QS4vEyV0S9XBfJNsXeUy8jg",
  authDomain: "rental-car-3a97a.firebaseapp.com",
  projectId: "rental-car-3a97a",
  storageBucket: "rental-car-3a97a.appspot.com",
  messagingSenderId: "153522700163",
  appId: "1:153522700163:web:3b73fd0bb4aae5626140b6",
  measurementId: "G-VVMSFJHD34",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, "gs://rental-945b7.appspot.com");
