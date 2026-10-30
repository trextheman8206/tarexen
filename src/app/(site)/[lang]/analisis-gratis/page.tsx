import type { Metadata } from "next";
import { SnapshotForm } from "@/components/SnapshotForm";
import { PLANS, type Region } from "@/config/pricing";
import { catName, t, type Lang } from "@/lib/i18n";
import { listCantons, listCategories, listProvinces, listSubcategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ plan?: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { plan } = await searchParams;
  const d = t(lang);
  if (plan === "business" || plan === "pro") return { title: d.form.planTitle.replace("{plan}", d.pricing.names[plan]) };
  return { title: d.form.title };
}

export default async function FreeAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ categoria?: string; plan?: string; region?: string }>;
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
  const plan = PLANS.find((p) => p.id === sp.plan);
  const region: Region = sp.region === "intl" || sp.region === "ec" ? sp.region : lang === "en" ? "intl" : "ec";
  // Planes de pago: título, texto y botón propios (no el del análisis gratis).
  const paid = plan && plan.id !== "free" ? plan : null;
  const planName = paid ? d.pricing.names[paid.id] : "";
  const priceText = paid
    ? `USD ${paid.price[region]}${paid.interval === "month" ? d.pricing.month : ` ${d.pricing.once}`}`
    : "";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="section-head">
          {paid ? (
            <>
              <span className="badge badge-brand" style={{ marginBottom: 10 }}>{planName} · {priceText}</span>
              <h1>{d.form.planTitle.replace("{plan}", planName)}</h1>
              <p>{d.form.planSubtitle.replace("{price}", priceText)}</p>
            </>
          ) : (
            <>
              <h1>{d.form.title}</h1>
              <p>{d.form.subtitle}</p>
            </>
          )}
        </div>
        <SnapshotForm
          lang={lang}
          labels={d.form}
          categories={cats}
          provinces={provinces}
          cantons={cantons}
          initialCategory={cats.some((c) => c.slug === sp.categoria) ? sp.categoria : undefined}
          plan={plan ? `${plan.id}:${region}` : undefined}
          submitLabel={paid ? d.form.planSubmit.replace("{plan}", planName) : undefined}
        />
      </div>
    </section>
  );
}
