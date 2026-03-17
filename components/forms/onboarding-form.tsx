"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { onboardingSchema, type OnboardingInput } from "@/lib/domain/schemas";
import { usTimezones } from "@/lib/domain/timezones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      timezone: "America/New_York",
      baseCurrency: "USD",
      defaultAccountLabel: "Main",
      experienceLevel: "intermediate",
    },
  });

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setMessage("Unable to save onboarding details.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Configure your journal</CardTitle>
        <CardDescription>Finish a few defaults so TradeTracker can scope trades, returns, and onboarding guidance correctly for {email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...form.register("displayName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultAccountLabel">Default account</Label>
            <Input id="defaultAccountLabel" {...form.register("defaultAccountLabel")} />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select onValueChange={(value) => form.setValue("timezone", value)} defaultValue={form.getValues("timezone")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usTimezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Experience</Label>
            <Select
              onValueChange={(value: OnboardingInput["experienceLevel"]) => form.setValue("experienceLevel", value)}
              defaultValue={form.getValues("experienceLevel")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New trader</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseCurrency">Base currency</Label>
            <Input id="baseCurrency" maxLength={3} {...form.register("baseCurrency")} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {message ? <p className="text-sm text-rose-300">{message}</p> : <div />}
            <Button disabled={pending} type="submit">
              Save workspace defaults
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
