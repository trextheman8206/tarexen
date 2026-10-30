import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE, whatsappLink } from "@/config/site";
import { isLang, t, type Lang } from "@/lib/i18n";

// Sin generateStaticParams: las páginas leen categorías de la base de datos y
// deben reflejar al instante los cambios hechos en el panel.

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: d.meta.title, template: "%s · TAREXEN" },
    description: d.meta.description,
    alternates: { languages: { es: "/es", en: "/en" } },
    openGraph: { title: d.meta.title, description: d.meta.description, locale: lang === "es" ? "es_EC" : "en_US", type: "website" },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang as Lang);
  const wa = whatsappLink(d.contact.waText);

  return (
    <html lang={lang === "es" ? "es-EC" : "en"}>
      <body>
        <a href="#main" className="skip">{lang === "es" ? "Saltar al contenido" : "Skip to content"}</a>
        <SiteHeader lang={lang} labels={d.nav} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container inner">
            <div style={{ maxWidth: 460 }}>
              <strong>TAREXEN AI Visibility</strong>
              <p>{d.footer.tagline}</p>
              <p className="small muted">{d.footer.disclaimer}</p>
            </div>
            <div style={{ display: "grid", gap: 6, alignContent: "start" }}>
              <Link href={`/${lang}/categorias`}>{d.nav.categories}</Link>
              <Link href={`/${lang}/precios`}>{d.nav.pricing}</Link>
              <Link href={`/${lang}/privacidad`}>{d.footer.privacy}</Link>
              {SITE.email && <a href={`mailto:${SITE.email}`}>{SITE.email}</a>}
              <Link href="/admin" className="small muted">{d.footer.admin}</Link>
            </div>
          </div>
          <div className="container small muted" style={{ marginTop: 20 }}>© {new Date().getFullYear()} TAREXEN · Ecuador</div>
        </footer>
        {wa && (
          <a href={wa} className="btn btn-wa wa-float" target="_blank" rel="noopener noreferrer" aria-label={d.contact.whatsapp}>
            WhatsApp
          </a>
        )}
      </body>
    </html>
  );
}
