"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { usTimezones } from "@/lib/domain/timezones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProfileFormProps = {
  email: string;
  displayName: string | null;
  timezone: string;
  baseCurrency: string;
};

export function ProfileForm({ user }: { user: ProfileFormProps }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [timezone, setTimezone] = useState(user.timezone);
  const [baseCurrency, setBaseCurrency] = useState(user.baseCurrency);

  function save() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, timezone, baseCurrency }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage({ text: payload?.error ?? "Unable to update profile.", ok: false });
        return;
      }

      setMessage({ text: "Profile updated.", ok: true });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name, timezone, and base currency.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-slate-50">Account</p>
          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseCurrency">Base currency</Label>
            <Input
              id="baseCurrency"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
              maxLength={3}
              placeholder="USD"
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usTimezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {message ? (
            <p className={`text-sm ${message.ok ? "text-emerald-300" : "text-rose-300"}`}>{message.text}</p>
          ) : (
            <div />
          )}
          <Button disabled={pending || !displayName.trim()} onClick={save}>
            Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
