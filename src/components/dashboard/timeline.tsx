"use client";

import { Calendar, CheckCircle2 } from "lucide-react";
import type { TimelineItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          スケジュール
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-5">
            {items.map((item, idx) => {
              const isValentine = item.date.includes("2/14");
              const isWhiteDay = item.date.includes("3/14");

              return (
                <div key={idx} className="flex gap-4 relative">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isValentine
                        ? "bg-primary text-primary-foreground"
                        : isWhiteDay
                          ? "bg-amber-400 text-white"
                          : "bg-card border-2 text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-sm font-semibold ${isValentine ? "text-primary" : isWhiteDay ? "text-amber-600" : ""}`}
                    >
                      {item.date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
