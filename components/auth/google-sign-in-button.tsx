"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { signInWithPopup } from "firebase/auth";

import { getFirebaseAuth, getGoogleProvider } from "@/lib/auth/firebase-client";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    try {
      setPending(true);
      setError(null);

      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Unable to create session.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  const firebaseAuth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();

  return (
    <div className="space-y-3">
      <Button onClick={handleSignIn} disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        Continue with Google
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
