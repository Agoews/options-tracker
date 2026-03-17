import { OnboardingForm } from "@/components/forms/onboarding-form";
import { requireAppUser } from "@/lib/server/auth-user";

export default async function OnboardingPage() {
  const user = await requireAppUser({ allowIncompleteOnboarding: true });

  return <OnboardingForm email={user.email} />;
}
