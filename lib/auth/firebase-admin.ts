import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { getServerEnv } from "@/lib/auth/runtime-env";

function createAdminApp() {
  const env = getServerEnv();

  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminAuth() {
  return getAuth(createAdminApp());
}
