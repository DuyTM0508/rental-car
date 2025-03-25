import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1ub06fM2ZrYzHytT4j9hDMduPU-p4-Pk",
  authDomain: "my-project-fc361.firebaseapp.com",
  projectId: "my-project-fc361",
  storageBucket: "my-project-fc361.appspot.com",
  messagingSenderId: "228002789297",
  appId: "1:228002789297:web:8cc732e99715ba25026f90"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, "gs://my-project-fc361.appspot.com");
