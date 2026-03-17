import { HoldingEntryForm } from "@/components/holdings/holding-entry-form";
import { TradeEntryWorkbench } from "@/components/trades/trade-entry-workbench";
import { requireAppUser } from "@/lib/server/auth-user";

export default async function NewTradePage() {
  await requireAppUser();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <TradeEntryWorkbench />
      <HoldingEntryForm />
    </div>
  );
}
