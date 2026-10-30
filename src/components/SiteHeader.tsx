"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

type Labels = { home: string; how: string; categories: string; pricing: string; faq: string; contact: string; cta: string; services: string };

export function SiteHeader({ lang, labels }: { lang: Lang; labels: Labels }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || `/${lang}`;
  const other: Lang = lang === "es" ? "en" : "es";
  const switchHref = pathname.replace(/^\/(es|en)(?=\/|$)/, `/${other}`);
  const base = `/${lang}`;
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href={base} className="logo" aria-label="TAREXEN — inicio">
          <span className="logo-mark" aria-hidden="true">✦</span>
          TAREXEN <small>AI Visibility</small>
        </Link>
        <button
          className="btn btn-ghost btn-sm menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"} <span className="sr-only">Menú</span>
        </button>
        <nav id="main-nav" className={`nav${open ? " open" : ""}`} aria-label="Principal">
          <Link href={base} onClick={close}>{labels.home}</Link>
          <Link href={`${base}#como-funciona`} onClick={close}>{labels.how}</Link>
          <Link href={`${base}/categorias`} onClick={close}>{labels.categories}</Link>
          <Link href={`${base}#servicios`} onClick={close}>{labels.services}</Link>
          <Link href={`${base}/precios`} onClick={close}>{labels.pricing}</Link>
          <Link href={`${base}#faq`} onClick={close}>{labels.faq}</Link>
          <Link href={`${base}#contacto`} onClick={close}>{labels.contact}</Link>
          <Link href={switchHref} className="lang-switch" hrefLang={other} lang={other} onClick={close}>
            {other.toUpperCase()}
          </Link>
          <Link href={`${base}/analisis-gratis`} className="btn btn-primary btn-sm" onClick={close} style={{ color: "#fff" }}>
            {labels.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
