import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Use bundled firebase-applet-config.json directly without referencing import.meta.env.VITE_FIREBASE_*
// to prevent AI Studio environment variable prompt popups.
const config = {
  projectId: rawConfig?.projectId || 'gen-lang-client-0855041857',
  appId: rawConfig?.appId || '1:375726309445:web:d9f1297773d4094601e32c',
  apiKey: rawConfig?.apiKey || 'AIzaSyDMgMWW0KpHmkFE05Z0zMl4PcFLKv5PMVk',
  authDomain: rawConfig?.authDomain || 'gen-lang-client-0855041857.firebaseapp.com',
  firestoreDatabaseId: (rawConfig as any)?.firestoreDatabaseId || 'ai-studio-dimensifotografi-20dced2c-3c35-4fd2-9b29-fd8ec361cfd1',
  storageBucket: rawConfig?.storageBucket || 'gen-lang-client-0855041857.firebasestorage.app',
  messagingSenderId: rawConfig?.messagingSenderId || '375726309445',
  oAuthClientId: (rawConfig as any)?.oAuthClientId || '375726309445-p48nvrl3l795nckgqld75soi2oeuu9vp.apps.googleusercontent.com',
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Firestore with explicit database ID
export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Add Google Drive OAuth Scope
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
];

DRIVE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Test Firestore connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    if (!navigator.onLine) {
      return false;
    }
    if (!config.projectId) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}
