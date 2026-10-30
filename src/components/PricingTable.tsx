"use client";

import Link from "next/link";
import { useState } from "react";
import { PAYPAL, PLANS, type Region } from "@/config/pricing";
import type { Lang } from "@/lib/i18n";
import { PayPalHostedButton } from "./PayPalHostedButton";

type Labels = {
  ec: string; intl: string; once: string; month: string; founder: string;
  names: Record<string, string>; cta: Record<string, string>;
  payNow: string; payFirstMonth: string; payAfter: string; payFail: string; monthlyNote: string;
};

export function PricingTable({ lang, labels }: { lang: Lang; labels: Labels }) {
  const [region, setRegion] = useState<Region>(lang === "en" ? "intl" : "ec");

  return (
    <div>
      <div className="seg" role="group" aria-label="Región">
        <button type="button" aria-pressed={region === "ec"} onClick={() => setRegion("ec")}>{labels.ec}</button>
        <button type="button" aria-pressed={region === "intl"} onClick={() => setRegion("intl")}>{labels.intl}</button>
      </div>
      <div className="grid grid-3">
        {PLANS.map((p) => {
          const paypalId = PAYPAL.hostedButtons[`${p.id}_${region}`];
          return (
            <div key={p.id} className={`card price-card${p.id === "business" ? " featured" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0 }}>{labels.names[p.id]}</h3>
                {p.founder && <span className="badge badge-warn">{labels.founder}</span>}
              </div>
              <div className="price">
                USD {p.price[region]}{" "}
                <small>{p.price[region] === 0 ? "" : p.interval === "month" ? labels.month : labels.once}</small>
              </div>
              <ul>
                {p.features.map((f) => (
                  <li key={f.es}>{f[lang]}</li>
                ))}
              </ul>
              {paypalId && (
                <div className="stack" style={{ gap: 6 }}>
                  <strong className="small">{p.interval === "month" ? labels.payFirstMonth : labels.payNow}</strong>
                  <PayPalHostedButton key={paypalId} buttonId={paypalId} failText={labels.payFail} />
                  <span className="small muted">{labels.payAfter}</span>
                </div>
              )}
              {p.interval === "month" && <span className="small muted">{labels.monthlyNote}</span>}
              <Link
                href={`/${lang}/analisis-gratis?plan=${p.id}`}
                className={`btn ${p.id === "business" && !paypalId ? "btn-primary" : "btn-ghost"}`}
              >
                {labels.cta[p.id]}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
