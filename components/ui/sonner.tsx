"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App toaster. Rendered once in the root layout; call `toast()` from sonner
 * anywhere (cart actions, admin saves) to surface feedback.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-surface text-foreground shadow-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
