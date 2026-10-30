import type { Metadata } from "next";
import Link from "next/link";
import { catName, t, type Lang } from "@/lib/i18n";
import { listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: t(lang).categories.title };
}

export default async function CategoriesPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const categories = await listCategories({ activeOnly: true });
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{d.categories.title}</h1>
          <p>{d.categories.subtitle}</p>
        </div>
        <div className="grid grid-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/${lang}/categorias/${c.slug}`} className="card cat-card">
              <span className="cat-icon" aria-hidden="true">{c.icon}</span>
              <strong>{catName(c, lang)}</strong>
              <p>{lang === "en" ? c.description_en : c.description_es}</p>
              <span className="small" style={{ color: "var(--brand)", fontWeight: 700, marginTop: "auto" }}>{d.categories.more} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
