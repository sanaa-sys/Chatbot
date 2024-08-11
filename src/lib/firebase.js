// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCi74d6zviYTiggGnIfV5jo_Fk531i0e60",
    authDomain: "chatbot-d5a99.firebaseapp.com",
    projectId: "chatbot-d5a99",
    storageBucket: "chatbot-d5a99.appspot.com",
    messagingSenderId: "804000314518",
    appId: "1:804000314518:web:afcbea854f34b1bbfbbeb7",
    measurementId: "G-QJP61CVLMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Initialize Google Auth Provider
export const provider = new GoogleAuthProvider();

// Optionally, you can set custom parameters for the provider (e.g., language)
provider.setCustomParameters({
    prompt: "select_account", // Forces account selection every time
});
export default app;