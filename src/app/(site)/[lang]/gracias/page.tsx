import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@/config/site";
import { t, type Lang } from "@/lib/i18n";

export const metadata: Metadata = { robots: { index: false } };

export default async function ThanksPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const wa = whatsappLink(d.contact.waText);
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 680, textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }} aria-hidden="true">✓</div>
        <h1>{d.thanks.title}</h1>
        <p className="muted" style={{ fontSize: "1.1rem" }}>{d.thanks.body}</p>
        <div className="card" style={{ textAlign: "left", margin: "28px 0" }}>
          <strong>{d.thanks.next}</strong>
          <p style={{ margin: "6px 0 0" }}>{d.thanks.tip}</p>
        </div>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link href={`/${lang}`} className="btn btn-ghost">{d.thanks.back}</Link>
          {wa && <a href={wa} className="btn btn-wa" target="_blank" rel="noopener noreferrer">{d.contact.whatsapp}</a>}
        </div>
      </div>
    </section>
  );
}
