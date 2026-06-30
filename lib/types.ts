/** Domain types shared across data access, server components and the admin. */

export interface Country {
  code: string;
  name: string;
  currency_code: string;
  currency_symbol: string;
  whatsapp_number: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCountry {
  product_id: string;
  country_code: string;
  price: number;
  is_available: boolean;
}

/**
 * A product resolved for a specific country: base product fields plus the
 * per-country price/availability and joined images + category. This is what
 * the public catalog renders.
 */
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: Pick<Category, "id" | "slug" | "name"> | null;
  images: Pick<ProductImage, "url" | "alt">[];
  price: number;
  is_available: boolean;
  sort_order: number;
}

/** Admin view: a product with its per-country pricing rows for editing. */
export interface AdminProduct extends Product {
  category: Pick<Category, "id" | "slug" | "name"> | null;
  images: ProductImage[];
  pricing: ProductCountry[];
}
