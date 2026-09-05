import * as React from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-border bg-panel", className)} {...props} />;
}
