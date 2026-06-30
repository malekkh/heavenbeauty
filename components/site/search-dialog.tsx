"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export interface SearchItem {
  slug: string;
  name: string;
  image: string | null;
  price: number;
  category: string | null;
}

/**
 * Client-side catalog search. The active country's products are passed in, so
 * filtering is instant with no extra requests.
 */
export function SearchDialog({
  items,
  countryCode,
}: {
  items: SearchItem[];
  countryCode: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search products">
          <Search className="size-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-surface shadow-2xl focus:outline-none">
          <Dialog.Title className="sr-only">Search products</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-5 shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tints…"
              className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
            <Dialog.Close
              className="rounded-full p-1 text-muted hover:text-foreground"
              aria-label="Close search"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted">
                No products match “{query}”.
              </p>
            ) : (
              results.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${countryCode}/product/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent-soft"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.category ? (
                      <p className="truncate text-xs text-muted">
                        {item.category}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-sm font-medium text-muted">
                    {formatMoney(item.price, countryCode)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
