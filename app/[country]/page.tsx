import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/site/marquee";
import { ProductCarousel } from "@/components/site/product-carousel";
import { MARQUEE_ROWS } from "@/lib/site-config";
import {
  getCatalogByCategory,
  getCatalogProducts,
} from "@/lib/data/queries";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [groups, catalog] = await Promise.all([
    getCatalogByCategory(country),
    getCatalogProducts({ country }),
  ]);

  const pure =
    catalog.find((p) => p.slug === "heavenly-tint-pure") ?? catalog[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-medium text-brand">
              <Sparkles className="size-4" /> Effortless Glow
            </span>
            <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Where Tint Meets Radiance
            </h1>
            <p className="max-w-md text-lg text-muted">
              A touch of color designed to enhance your natural glow — soft,
              radiant, and effortlessly you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="brand">
                <Link href={`/${country}/shop`}>
                  Shop All <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/${country}/our-story`}>Our Story</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-accent-soft">
              {pure?.images[0]?.url ? (
                <Image
                  src={pure.images[0].url}
                  alt={pure.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="absolute -bottom-4 -left-2 hidden rounded-xl border border-border bg-surface px-5 py-3 shadow-lg sm:block">
              <p className="font-display text-lg">Your glow speaks</p>
              <p className="text-sm text-muted">we simply enhance it.</p>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={MARQUEE_ROWS[0]} />

      {/* Category carousels */}
      <div className="mx-auto max-w-6xl px-4">
        {groups.map((group, i) => (
          <ProductCarousel
            key={group.category.id}
            title={group.category.name}
            products={group.products}
            countryCode={country}
            viewAllHref={`/${country}/shop?category=${group.category.slug}`}
            priority={i === 0}
          />
        ))}
      </div>

      {/* Glow statement */}
      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            Your glow speaks for itself — we simply enhance it.
          </p>
        </div>
      </section>

      {/* Introducing PURE */}
      {pure ? (
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div className="relative order-2 aspect-square overflow-hidden rounded-2xl border border-border bg-accent-soft lg:order-1">
            {pure.images[0]?.url ? (
              <Image
                src={pure.images[0].url}
                alt={pure.name}
                fill
                sizes="(min-width: 1024px) 32rem, 90vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="order-1 flex flex-col items-start gap-4 lg:order-2">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
              The first of its kind
            </span>
            <h2 className="font-display text-4xl sm:text-5xl">
              Introducing PURE
            </h2>
            <p className="max-w-md text-lg text-muted">
              A soft, light pink created to enhance your natural beauty,
              blending seamlessly into your skin for a fresh, radiant glow that
              feels effortless and true to you.
            </p>
            <Button asChild size="lg" variant="brand">
              <Link href={`/${country}/product/${pure.slug}`}>
                Shop PURE <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {/* Our Story teaser */}
      <section className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Our Story
          </span>
          <p className="mt-4 font-display text-2xl leading-relaxed sm:text-3xl">
            Heaven Beauty was created to redefine beauty as something
            effortless — crafted to enhance your natural radiance, never mask
            it.
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link href={`/${country}/our-story`}>
              Read our story <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Our Difference */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl">Our Difference</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Designed with good intention, made to feel like nothing on your
            skin. Long-lasting, blendable tints that adapt to every tone.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Self-love infused",
              copy: "Made to celebrate your natural beauty, every day.",
            },
            {
              icon: Leaf,
              title: "Vegan & conscious",
              copy: "100% vegan, cruelty-free, and kind to your skin.",
            },
            {
              icon: Sparkles,
              title: "Lightweight feel",
              copy: "A soft, radiant glow — gentle even for sensitive skin.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-8 text-center"
            >
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent-soft text-brand">
                <item.icon className="size-6" />
              </div>
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <Marquee items={MARQUEE_ROWS[1]} speedSeconds={32} />
    </>
  );
}
