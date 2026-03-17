import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireAppUser } from "@/lib/server/auth-user";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await requireAppUser({ allowIncompleteOnboarding: true });

  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
