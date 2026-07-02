"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Globe,
  Users,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/countries", label: "Countries", icon: Globe },
  { href: "/admin/users", label: "Users", icon: Users },
];

/**
 * Admin navigation. `vertical` for the desktop sidebar; `horizontal` for the
 * mobile top bar, where it becomes a single scrollable row of chips.
 */
export function AdminNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";
  return (
    <nav
      className={cn(
        "gap-1",
        horizontal
          ? "flex flex-row overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex flex-col"
      )}
    >
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:gap-3",
              active
                ? "bg-brand text-brand-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
