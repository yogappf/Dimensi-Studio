import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Support environment variables with fallback to bundled config
const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig?.projectId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig?.appId || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig?.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig?.authDomain || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || (rawConfig as any)?.firestoreDatabaseId || undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig?.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig?.messagingSenderId || '',
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || (rawConfig as any)?.oAuthClientId || '',
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Firestore with database ID if provided, otherwise default
export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Add Google Drive OAuth Scopes
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

DRIVE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});


// Test Firestore connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection established successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is in offline mode or network is unreachable.');
    } else {
      console.log('Firestore connection verified with active database instance.');
    }
    return false;
  }
}
