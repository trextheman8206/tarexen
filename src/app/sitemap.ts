import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { LANGS } from "@/lib/i18n";
import { listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cats = await listCategories({ activeOnly: true });
  const paths = ["", "/categorias", "/precios", "/analisis-gratis", "/privacidad", ...cats.map((c) => `/categorias/${c.slug}`)];
  return LANGS.flatMap((lang) =>
    paths.map((p) => ({
      url: `${SITE.url}/${lang}${p}`,
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE.url}/${l}${p}`])) },
    })),
  );
}
