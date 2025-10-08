// This file initializes the Firebase SDK and exports the necessary Firebase services.
// It uses the configuration from `api-keys.ts`.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './api-keys';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
