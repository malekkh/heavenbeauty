import Link from "next/link";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-brand">404</p>
      <h1 className="font-display text-2xl">This page drifted off.</h1>
      <p className="text-muted">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href={`/${DEFAULT_COUNTRY}`}
        className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:bg-brand/90"
      >
        Back to Heaven Beauty
      </Link>
    </div>
  );
}
