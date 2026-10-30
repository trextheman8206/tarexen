import Link from "next/link";
import { PricingTable } from "@/components/PricingTable";
import { SITE, whatsappLink } from "@/config/site";
import { catName, t, type Lang } from "@/lib/i18n";
import { listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const categories = await listCategories({ activeOnly: true });
  const wa = whatsappLink(d.contact.waText);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: SITE.product,
      url: `${SITE.url}/${lang}`,
      areaServed: { "@type": "Country", name: "Ecuador" },
      description: d.meta.description,
      ...(SITE.email ? { email: SITE.email } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: d.faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">{d.hero.eyebrow}</span>
            <h1>{d.hero.title}</h1>
            <p className="lead">{d.hero.subtitle}</p>
            <div className="btn-row">
              <Link href={`/${lang}/analisis-gratis`} className="btn btn-primary">{d.hero.primary}</Link>
              <a href="#como-funciona" className="btn btn-ghost">{d.hero.secondary}</a>
            </div>
            <ul className="trust">
              {d.hero.trust.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>

          <figure className="demo" style={{ margin: 0 }} aria-label={d.example.badge}>
            <span className="badge badge-warn" style={{ marginBottom: 10 }}>{d.example.badge}</span>
            <div className="chat">
              <div className="small muted" style={{ marginBottom: 8 }}>{d.example.platform}</div>
              <div className="bubble-q">{d.example.question}</div>
              <div className="bubble-a">
                {d.example.answer}
                <ol>
                  {d.example.items.map((x, i) => (
                    <li key={x} className={i === 2 ? "you" : undefined}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="audit-log">
              <strong className="small">{d.example.auditTitle}</strong>
              <dl>
                {d.example.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </figure>
        </div>
      </section>

      <section id="como-funciona" className="section section-alt">
        <div className="container">
          <div className="section-head"><h2>{d.steps.title}</h2></div>
          <div className="grid grid-3 steps">
            {d.steps.items.map(([title, body]) => (
              <div key={title} className="card step">
                <h3>{title}</h3>
                <p className="muted" style={{ margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{d.beforeAfter.title}</h2>
            <p><span className="badge badge-warn">{d.example.badge}</span></p>
          </div>
          <div className="ba">
            <div className="card before">
              <h3>{d.beforeAfter.before}</h3>
              <ul>{d.beforeAfter.beforeItems.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className="card after">
              <h3>{d.beforeAfter.after}</h3>
              <ul>{d.beforeAfter.afterItems.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 14 }}>{d.beforeAfter.note}</p>
        </div>
      </section>

      <section id="categorias" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>{d.categories.title}</h2>
            <p>{d.categories.subtitle}</p>
          </div>
          <div className="grid grid-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/${lang}/categorias/${c.slug}`} className="card cat-card">
                <span className="cat-icon" aria-hidden="true">{c.icon}</span>
                <strong>{catName(c, lang)}</strong>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 20 }}><Link href={`/${lang}/categorias`}>{d.categories.all} →</Link></p>
        </div>
      </section>

      <section id="servicios" className="section">
        <div className="container">
          <div className="section-head">
            <h2>{d.services.title}</h2>
            <p>{d.services.subtitle}</p>
          </div>
          <ol className="grid grid-2" style={{ paddingLeft: 20, gap: "8px 32px" }}>
            {d.services.items.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </div>
      </section>

      <section id="precios" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>{d.pricing.title}</h2>
            <p>{d.pricing.subtitle}</p>
          </div>
          <PricingTable lang={lang} labels={d.pricing} />
          <p className="small muted" style={{ marginTop: 16 }}>{d.pricing.disclaimer}</p>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container faq" style={{ maxWidth: 820 }}>
          <h2>{d.faq.title}</h2>
          {d.faq.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contacto" className="section section-alt">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{d.contact.title}</h2>
          <p className="muted">{d.contact.subtitle}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link href={`/${lang}/analisis-gratis`} className="btn btn-primary">{d.hero.primary}</Link>
            {wa && <a href={wa} className="btn btn-wa" target="_blank" rel="noopener noreferrer">{d.contact.whatsapp}</a>}
            {SITE.email && <a href={`mailto:${SITE.email}`} className="btn btn-ghost">{d.contact.email}</a>}
          </div>
        </div>
      </section>
    </>
  );
}
