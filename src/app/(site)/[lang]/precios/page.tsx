import type { Metadata } from "next";
import { PricingTable } from "@/components/PricingTable";
import { t, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: t(lang).pricing.title };
}

export default async function PricingPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{d.pricing.title}</h1>
          <p>{d.pricing.subtitle}</p>
        </div>
        <PricingTable lang={lang} labels={d.pricing} />
        <p className="small muted" style={{ marginTop: 16 }}>{d.pricing.disclaimer}</p>
        <div className="faq" style={{ maxWidth: 820, marginTop: 48 }}>
          <h2>{d.faq.title}</h2>
          {d.faq.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
