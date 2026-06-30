import { cn } from "@/lib/utils";

/**
 * Infinite ticker strip. Content is duplicated so the CSS translate animation
 * loops seamlessly. Pure CSS — no JS, and it pauses for reduced-motion users.
 */
export function Marquee({
  items,
  className,
  speedSeconds = 28,
}: {
  items: string[];
  className?: string;
  speedSeconds?: number;
}) {
  const track = [...items, ...items];
  return (
    <div
      className={cn(
        "overflow-hidden border-y border-border bg-brand py-3 text-brand-foreground",
        className
      )}
    >
      <div
        className="hb-marquee"
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {track.map((item, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center text-sm font-medium uppercase tracking-[0.2em]"
            aria-hidden={i >= items.length}
          >
            <span className="mr-12">{item}</span>
            <span className="opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
