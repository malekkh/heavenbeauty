import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Feather, Leaf, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Founded by Lebanese beauty influencer Sarah Hammoud, Heaven Beauty was born from years of testing and a passion for effortless, radiant beauty.",
};

const PILLARS = [
  { icon: Leaf, title: "Cruelty free", copy: "Never tested on animals." },
  { icon: Feather, title: "Lightweight feel", copy: "Feels like nothing on." },
  { icon: Sparkles, title: "Vegan & conscious", copy: "100% vegan formulas." },
  { icon: Heart, title: "Self-love infused", copy: "Made to celebrate you." },
];

export default function OurStoryPage() {
  return (
    <div className="pb-16">
      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 pt-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
          Welcome to
        </p>
        <h1 className="mt-2 font-display text-5xl sm:text-6xl">Heaven Beauty</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          A touch of color designed to enhance your natural glow — soft,
          radiant, and effortlessly you.
        </p>
      </section>

      {/* The Beginning — the founder */}
      <section className="mx-auto mt-14 grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <div className="relative order-first aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-accent-soft">
          <Image
            src="/our-story/founder.jpg"
            alt="Sarah Hammoud, founder of Heaven Beauty"
            fill
            priority
            sizes="(min-width: 1024px) 32rem, 90vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-start gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            The Beginning
          </p>
          <p className="font-display text-3xl leading-snug text-foreground sm:text-4xl">
            Founded by Lebanese beauty influencer{" "}
            <span className="text-brand">Sarah Hammoud</span>.
          </p>
          <p className="text-lg leading-relaxed text-muted">
            The brand was born from years of testing, reviewing, and
            understanding what truly works — and what doesn&apos;t. With a deep
            connection to her audience, Sarah set out to create products that
            deliver flawless results while meeting the expectations of a modern,
            mindful generation.
          </p>
          <p className="text-lg leading-relaxed text-muted">
            We started with tints for lips and cheeks. Since then, we&apos;ve
            crafted each formula to enhance your natural radiance effortlessly.
          </p>
        </div>
      </section>

      {/* self-love infused */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[16/6]">
          <Image
            src="/our-story/story.jpg"
            alt="Heaven Beauty heart tints with fresh berries"
            fill
            sizes="(min-width: 1024px) 64rem, 92vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 grid place-items-center px-4 text-center">
            <p className="font-display text-3xl text-white sm:text-5xl">
              self-love infused
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>
    </div>
  );
}
