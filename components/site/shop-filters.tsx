"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Category filter chips for the shop. The product grid is server-rendered
 * (good for SEO/perf and works with JS off); this only toggles visibility of
 * the already-present cards via their `data-category` attribute, and syncs the
 * `?category=` query param for shareable links.
 */
function applyFilter(slug: string) {
  const items = document.querySelectorAll<HTMLElement>("[data-shop-item]");
  items.forEach((el) => {
    const match = slug === "all" || el.dataset.category === slug;
    el.classList.toggle("hidden", !match);
  });
}

export function ShopFilters({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(searchParams.get("category") ?? "all");

  // Apply (and re-apply) the active filter to the server-rendered cards.
  useEffect(() => {
    applyFilter(active);
  }, [active]);

  const select = (slug: string) => {
    setActive(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Chip label="All" active={active === "all"} onClick={() => select("all")} />
      {categories.map((c) => (
        <Chip
          key={c.slug}
          label={c.name}
          active={active === c.slug}
          onClick={() => select(c.slug)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-surface hover:bg-accent-soft"
      )}
    >
      {label}
    </button>
  );
}
