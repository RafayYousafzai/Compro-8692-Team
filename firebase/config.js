import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDks6yRXWpG_njqwwsyU_-3OzsZo5gmG-8",
  authDomain: "voting-webapp-b036d.firebaseapp.com",
  projectId: "voting-webapp-b036d",
  storageBucket: "voting-webapp-b036d.appspot.com",
  messagingSenderId: "746342672553",
  appId: "1:746342672553:web:3cdf4233c1bbd3bddfa1b8",
  measurementId: "G-4GCZ3KBXKJ",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
