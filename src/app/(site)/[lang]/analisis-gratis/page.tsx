import type { Metadata } from "next";
import { SnapshotForm } from "@/components/SnapshotForm";
import { catName, t, type Lang } from "@/lib/i18n";
import { listCantons, listCategories, listProvinces, listSubcategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: t(lang).form.title };
}

export default async function FreeAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ categoria?: string; plan?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const d = t(lang);
  const [categories, subs, provinces, cantons] = await Promise.all([
    listCategories({ activeOnly: true }),
    listSubcategories(undefined, true),
    listProvinces(),
    listCantons(),
  ]);
  const cats = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: catName(c, lang),
    subs: subs.filter((s) => s.category_id === c.id).map((s) => ({ id: s.id, name: lang === "en" ? s.name_en : s.name_es })),
  }));
  const plan = ["free", "business", "pro"].includes(sp.plan ?? "") ? sp.plan : undefined;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="section-head">
          <h1>{d.form.title}</h1>
          <p>{d.form.subtitle}</p>
        </div>
        <SnapshotForm
          lang={lang}
          labels={d.form}
          categories={cats}
          provinces={provinces}
          cantons={cantons}
          initialCategory={cats.some((c) => c.slug === sp.categoria) ? sp.categoria : undefined}
          plan={plan}
        />
      </div>
    </section>
  );
}
