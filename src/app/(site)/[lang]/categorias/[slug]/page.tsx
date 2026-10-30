import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catName, t, type Lang } from "@/lib/i18n";
import { getCategoryBySlug, listChecklist, listQuestions, listSubcategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: Lang; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return {};
  const name = catName(cat, lang);
  return {
    title: lang === "en" ? `AI visibility for ${name} in Ecuador` : `Visibilidad en IA para ${name.toLowerCase()} en Ecuador`,
    description: lang === "en" ? cat.description_en : cat.description_es,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { lang, slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat || !cat.active) notFound();
  const d = t(lang);
  const [checks, questions, subs] = await Promise.all([
    listChecklist(cat.id),
    listQuestions(cat.id),
    listSubcategories(cat.id, true),
  ]);
  const base = checks.filter((c) => c.category_id === null);
  const specific = checks.filter((c) => c.category_id !== null);
  const label = (c: { label_es: string; label_en: string }) => (lang === "en" ? c.label_en : c.label_es);
  // Ejemplo con un cantón real; en la auditoría se usa el cantón del cliente.
  const sampleCity = "Otavalo";

  return (
    <>
      <section className="hero">
        <div className="container" style={{ maxWidth: 860 }}>
          <span className="eyebrow">{d.catPage.eyebrow} · {catName(cat, lang)}</span>
          <h1><span aria-hidden="true">{cat.icon}</span> {lang === "en" ? `AI visibility for ${catName(cat, lang).toLowerCase()} in Ecuador` : `Visibilidad en IA para ${catName(cat, lang).toLowerCase()} en Ecuador`}</h1>
          <p className="lead" style={{ fontSize: "1.2rem", color: "var(--ink-2)" }}>{lang === "en" ? cat.description_en : cat.description_es}</p>
          <Link href={`/${lang}/analisis-gratis?categoria=${cat.slug}`} className="btn btn-primary">{d.catPage.cta}</Link>
        </div>
      </section>

      {questions.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <h2>{d.catPage.questions}</h2>
              <p>{d.catPage.questionsNote}</p>
            </div>
            <div className="grid grid-2">
              {questions.map((q) => (
                <div key={q.id} className="card">
                  <div className="bubble-q" style={{ marginLeft: 0 }}>
                    {(lang === "en" && q.text_en ? q.text_en : q.text_es).replaceAll("{ciudad}", sampleCity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head"><h2>{d.catPage.checks}</h2></div>
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card">
              <h3>{d.catPage.specific}</h3>
              <ul className="checklist" style={{ columns: 1 }}>{specific.map((c) => <li key={c.id}>{label(c)}</li>)}</ul>
            </div>
            <div className="card">
              <h3>{d.catPage.base}</h3>
              <ul className="checklist" style={{ columns: 1 }}>{base.map((c) => <li key={c.id}>{label(c)}</li>)}</ul>
            </div>
          </div>
          {subs.length > 0 && (
            <>
              <h3 style={{ marginTop: 36 }}>{d.catPage.types}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {subs.map((s) => <span key={s.id} className="badge">{lang === "en" ? s.name_en : s.name_es}</span>)}
              </div>
            </>
          )}
          <p className="small muted" style={{ marginTop: 28 }}>{d.pricing.disclaimer}</p>
          <Link href={`/${lang}/analisis-gratis?categoria=${cat.slug}`} className="btn btn-primary">{d.catPage.cta}</Link>
        </div>
      </section>
    </>
  );
}
