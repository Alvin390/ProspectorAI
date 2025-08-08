
// Firebase App (the core Firebase SDK) is always required
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, User as FirebaseUser } from 'firebase/auth';

export type { FirebaseUser };

// Your web app's Firebase configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration
// You can get these values from the Firebase console:
// 1. Go to your project's settings.
// 2. In the "Your apps" card, select the app for which you need a config object.
// 3. From the "Firebase SDK snippet" pane, select "Config".
// 4. Copy the config object and paste the values here.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Always initialize Firebase once, regardless of environment
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth, app };
