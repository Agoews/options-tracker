import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";
import { ProfileForm } from "@/components/forms/profile-form";
import { PortfolioCapitalPanel } from "@/components/dashboard/portfolio-capital-panel";

export default async function ProfilePage() {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProfileForm user={user} />
      <PortfolioCapitalPanel capacity={snapshot.portfolioCapacity} funding={snapshot.funding} />
    </div>
  );
}
