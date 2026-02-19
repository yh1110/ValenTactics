"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Warnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <Alert className="border-2 border-amber-300/50 bg-amber-50 [&>svg]:text-amber-600">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-amber-800 font-bold">リスク警告</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1.5">
          {warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {w}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
