import type { Metadata } from "next";
import { Heart, Feather, Leaf, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Heaven Beauty was created to redefine beauty as something effortless.",
};

const PILLARS = [
  { icon: Leaf, title: "Cruelty free", copy: "Never tested on animals." },
  { icon: Feather, title: "Lightweight feel", copy: "Feels like nothing on." },
  { icon: Sparkles, title: "Vegan & conscious", copy: "100% vegan formulas." },
  { icon: Heart, title: "Self-love infused", copy: "Made to celebrate you." },
];

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
          Welcome to
        </p>
        <h1 className="mt-2 font-display text-5xl sm:text-6xl">
          Heaven Beauty
        </h1>
      </header>

      <div className="mx-auto mt-12 max-w-2xl space-y-8 text-lg leading-relaxed text-muted">
        <div>
          <h2 className="font-display text-2xl text-foreground">The Story</h2>
          <p className="mt-3">
            Heaven Beauty was created to redefine beauty as something
            effortless — crafted to enhance your natural radiance, never mask
            it. Every formula is made with intention, designed to feel
            weightless and look luminous.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-foreground">
            The Beginning
          </h2>
          <p className="mt-3">
            We started with tints for lips and cheeks. Since then, we have
            crafted each formula to enhance your natural radiance effortlessly —
            buildable, blendable, and kind to every skin tone.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-surface p-6 text-center"
          >
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent-soft text-brand">
              <p.icon className="size-6" />
            </div>
            <h3 className="font-display text-lg">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
