import { redirect } from "next/navigation";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Bare `/` is normally rewritten to `/{country}` by the proxy (geo) layer.
 * This is the static fallback for when the proxy doesn't run (e.g. the
 * matcher skips a path, or geo is unavailable): send visitors to the
 * default country so there is never a dead root.
 */
export default function RootPage() {
  redirect(`/${DEFAULT_COUNTRY}`);
}
