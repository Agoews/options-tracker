"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

import { getClientEnv } from "@/lib/auth/runtime-env";

export function getFirebaseAuth() {
  const env = getClientEnv();
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
          messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });

  return getAuth(app);
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
}
