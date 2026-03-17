import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getSessionClaims } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const claims = await getSessionClaims();

  if (claims) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TradeTracker</p>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Use Google via Firebase Authentication. The backend exchanges the ID token for a secure session cookie and scopes all data to that Firebase user.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </main>
  );
}
