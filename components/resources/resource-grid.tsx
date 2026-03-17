import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { strategyResources } from "@/lib/content/resources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ResourceGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {strategyResources.map((resource) => (
        <Card key={resource.slug}>
          <CardHeader>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-slate-400">
              {resource.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-in" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
              Start journaling
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
