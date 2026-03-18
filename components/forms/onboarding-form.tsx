"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { onboardingSchema, type OnboardingInput } from "@/lib/domain/schemas";
import { applyFieldErrors, readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import { usTimezones } from "@/lib/domain/timezones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError } from "@/components/ui/field-error";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OnboardingForm({
  email,
  initialPortfolioBaselineValue,
  initialPortfolioBaselineAt,
}: {
  email: string;
  initialPortfolioBaselineValue: number;
  initialPortfolioBaselineAt: Date | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "error" | "success" } | null>(null);
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      timezone: "America/New_York",
      baseCurrency: "USD",
      defaultAccountLabel: "Main",
      experienceLevel: "intermediate",
      portfolioBaselineValue: initialPortfolioBaselineValue,
      portfolioBaselineAt: initialPortfolioBaselineAt ?? new Date(),
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const portfolioBaselineAt = form.watch("portfolioBaselineAt");

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      setMessage(null);
      form.clearErrors();

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to save onboarding details.");
        applyFieldErrors(form.setError, error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      router.push(withStatus("/dashboard", new URLSearchParams(), "onboarding-saved"));
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
            <FieldError message={form.formState.errors.displayName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultAccountLabel">Default account</Label>
            <Input id="defaultAccountLabel" {...form.register("defaultAccountLabel")} />
            <FieldError message={form.formState.errors.defaultAccountLabel?.message} />
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
            <FieldError message={form.formState.errors.timezone?.message} />
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
            <FieldError message={form.formState.errors.experienceLevel?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseCurrency">Base currency</Label>
            <Input id="baseCurrency" maxLength={3} {...form.register("baseCurrency")} />
            <FieldError message={form.formState.errors.baseCurrency?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolioBaselineValue">Portfolio value at start</Label>
            <Input id="portfolioBaselineValue" type="number" step="0.01" {...form.register("portfolioBaselineValue")} />
            <FieldError message={form.formState.errors.portfolioBaselineValue?.message} />
          </div>
          <div className="space-y-2">
            <Label>Tracking starts</Label>
            <DatePicker
              value={portfolioBaselineAt}
              onChange={(date) => form.setValue("portfolioBaselineAt", date ?? new Date(), { shouldValidate: true })}
            />
            <FieldError message={form.formState.errors.portfolioBaselineAt?.message} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : <div />}
            <Button disabled={pending} type="submit">
              Save workspace defaults
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
