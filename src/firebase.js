// Importez les modules nécessaires de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyASQGxmHPAnOuqogJ-GshsKxZs7z_rVFhc",
  authDomain: "cloud-pro-salma.firebaseapp.com",
  projectId: "cloud-pro-salma",
  storageBucket: "cloud-pro-salma.firebasestorage.app",
  messagingSenderId: "270378042783",
  appId: "1:270378042783:web:7d23dc50345ca548b329aa",
  measurementId: "G-HCN9MZ9RYX"
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);

// Initialisez Firebase Authentication
export const auth = getAuth(app); // Instance d'authentification

// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app); // Vous pouvez supprimer cette ligne si Analytics n'est pas utilisé

// Exportez l'application Firebase par défaut
export default app;
