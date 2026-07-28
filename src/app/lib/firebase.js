"use client";

import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env
      .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

validateFirebaseConfig(firebaseConfig);

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

function validateFirebaseConfig(config) {
  const environmentVariables = {
    apiKey:
      "NEXT_PUBLIC_FIREBASE_API_KEY",

    authDomain:
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",

    projectId:
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",

    storageBucket:
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",

    messagingSenderId:
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",

    appId:
      "NEXT_PUBLIC_FIREBASE_APP_ID",
  };

  const missingVariables = Object.entries(
    environmentVariables
  )
    .filter(([configKey]) => !config[configKey])
    .map(([, variableName]) => variableName);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingVariables.join(
        ", "
      )}`
    );
  }
}