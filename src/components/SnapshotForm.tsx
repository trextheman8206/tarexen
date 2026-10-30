"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitSnapshot, type SnapshotState } from "@/app/(site)/[lang]/analisis-gratis/actions";
import type { Lang, t } from "@/lib/i18n";

type Cat = { id: number; slug: string; name: string; subs: { id: number; name: string }[] };
type Labels = ReturnType<typeof t>["form"];

type Props = {
  lang: Lang;
  labels: Labels;
  categories: Cat[];
  provinces: { code: string; name: string }[];
  cantons: { code: string; province_code: string; name: string }[];
  initialCategory?: string;
  plan?: string;
  submitLabel?: string;
};

const INITIAL: SnapshotState = { attempt: 0, errors: {}, values: {} };

export function SnapshotForm({ lang, labels: L, categories, provinces, cantons, initialCategory, plan, submitLabel }: Props) {
  const [state, action, pending] = useActionState(submitSnapshot, INITIAL);
  const v = state.values;
  const e = state.errors;

  const [category, setCategory] = useState(v.category ?? initialCategory ?? "");
  const [province, setProvince] = useState(v.province ?? "");
  const [canton, setCanton] = useState(v.canton ?? "");
  const [parish, setParish] = useState(v.parish ?? "");
  const [parishes, setParishes] = useState<{ id: number; name: string; kind: string }[] | null>(null);
  const [delivery, setDelivery] = useState(v.delivery === "on");
  const errRef = useRef<HTMLDivElement>(null);

  const cat = categories.find((c) => c.slug === category);
  const provinceCantons = useMemo(() => cantons.filter((c) => c.province_code === province), [cantons, province]);

  useEffect(() => {
    if (!canton) { setParishes(null); return; }
    let alive = true;
    fetch(`/api/parroquias?canton=${canton}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => { if (alive) setParishes(rows); })
      .catch(() => { if (alive) setParishes([]); });
    return () => { alive = false; };
  }, [canton]);

  useEffect(() => {
    if (state.attempt > 0 && Object.keys(e).length) errRef.current?.focus();
  }, [state.attempt, e]);

  const err = (name: string) =>
    e[name] ? <span className="err" id={`${name}-err`}>{e[name]}</span> : null;
  const aria = (name: string) =>
    e[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-err` } : {};
  const opt = <span className="muted small"> ({L.optional})</span>;
  const needsParishText = !parishes || parishes.length === 0 || parish === "other";

  return (
    <form action={action} className="form" key={state.attempt} noValidate>
      <input type="hidden" name="lang" value={lang} />
      {plan && <input type="hidden" name="plan" value={plan} />}
      <div className="hp" aria-hidden="true">
        <label>Company URL<input type="text" name="company_url" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {Object.keys(e).length > 0 && (
        <div className="alert alert-error" role="alert" tabIndex={-1} ref={errRef}>
          {e._form ?? L.errors}
        </div>
      )}

      <fieldset>
        <legend>{L.sections.business}</legend>
        <div className="field">
          <label htmlFor="name">{L.name}</label>
          <input id="name" name="name" type="text" required defaultValue={v.name} autoComplete="organization" {...aria("name")} />
          {err("name")}
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="category">{L.category}</label>
            <select id="category" name="category" required value={category} onChange={(ev) => setCategory(ev.target.value)} {...aria("category")}>
              <option value="">{L.select}</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            {err("category")}
          </div>
          {cat && cat.subs.length > 0 && (
            <div className="field">
              <label htmlFor="subcategory">{L.subcategory}{opt}</label>
              <select id="subcategory" name="subcategory" defaultValue={v.subcategory}>
                <option value="">{L.select}</option>
                {cat.subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {cat?.slug === "otros" && (
            <div className="field">
              <label htmlFor="other_industry">{L.otherIndustry}</label>
              <input id="other_industry" name="other_industry" type="text" defaultValue={v.other_industry} {...aria("other_industry")} />
              {err("other_industry")}
            </div>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>{L.sections.location}</legend>
        <div className="row-2">
          <div className="field">
            <label htmlFor="province">{L.province}</label>
            <select id="province" name="province" required value={province}
              onChange={(ev) => { setProvince(ev.target.value); setCanton(""); setParish(""); }} {...aria("province")}>
              <option value="">{L.select}</option>
              {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            {err("province")}
          </div>
          <div className="field">
            <label htmlFor="canton">{L.canton}</label>
            <select id="canton" name="canton" required value={canton} disabled={!province}
              onChange={(ev) => { setCanton(ev.target.value); setParish(""); }} {...aria("canton")}>
              <option value="">{L.select}</option>
              {provinceCantons.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {err("canton")}
          </div>
        </div>
        {canton && parishes && parishes.length > 0 && (
          <div className="field">
            <label htmlFor="parish">{L.parish}{opt}</label>
            <select id="parish" name="parish" value={parish} onChange={(ev) => setParish(ev.target.value)} {...aria("parish")}>
              <option value="">{L.select}</option>
              {parishes.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.kind})</option>)}
              <option value="other">{lang === "es" ? "Otra / no aparece" : "Other / not listed"}</option>
            </select>
            {err("parish")}
          </div>
        )}
        {canton && needsParishText && (
          <div className="field">
            <label htmlFor="parish_text">{L.parishText}{opt}</label>
            {parishes && parishes.length === 0 && <span className="hint">{L.noParishes}</span>}
            <input id="parish_text" name="parish_text" type="text" defaultValue={v.parish_text} />
          </div>
        )}
        <div className="row-2">
          <div className="field">
            <label htmlFor="neighborhood">{L.neighborhood}{opt}</label>
            <input id="neighborhood" name="neighborhood" type="text" defaultValue={v.neighborhood} />
          </div>
          <div className="field">
            <label htmlFor="address">{L.address}</label>
            <input id="address" name="address" type="text" defaultValue={v.address} autoComplete="street-address" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>{L.sections.area}</legend>
        <div className="grid grid-2" style={{ gap: 10, marginBottom: 14 }}>
          <label className="check"><input type="checkbox" name="has_location" defaultChecked={state.attempt === 0 || v.has_location === "on"} /> {L.hasLocation}</label>
          <label className="check"><input type="checkbox" name="in_person" defaultChecked={state.attempt === 0 || v.in_person === "on"} /> {L.inPerson}</label>
          <label className="check"><input type="checkbox" name="online" defaultChecked={v.online === "on"} /> {L.online}</label>
          <label className="check"><input type="checkbox" name="delivery" checked={delivery} onChange={(ev) => setDelivery(ev.target.checked)} /> {L.delivery}</label>
        </div>
        {delivery && (
          <div className="field">
            <label htmlFor="delivery_area">{L.deliveryArea}</label>
            <input id="delivery_area" name="delivery_area" type="text" defaultValue={v.delivery_area} />
          </div>
        )}
        <div className="row-2">
          <div className="field">
            <label htmlFor="service_area">{L.serviceArea}{opt}</label>
            <input id="service_area" name="service_area" type="text" defaultValue={v.service_area} />
          </div>
          <div className="field">
            <label htmlFor="nearby">{L.nearby}{opt}</label>
            <input id="nearby" name="nearby" type="text" defaultValue={v.nearby} />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>{L.sections.online}</legend>
        <div className="row-2">
          <div className="field">
            <label htmlFor="website">{L.website}{opt}</label>
            <input id="website" name="website" type="url" inputMode="url" placeholder="minegocio.com" defaultValue={v.website} {...aria("website")} />
            {err("website")}
          </div>
          <div className="field">
            <label htmlFor="gbp">{L.gbp}{opt}</label>
            <input id="gbp" name="gbp" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" defaultValue={v.gbp} {...aria("gbp")} />
            {err("gbp")}
          </div>
        </div>
        <div className="field">
          <label htmlFor="social">{L.social}{opt}</label>
          <textarea id="social" name="social" rows={3} placeholder="instagram.com/minegocio" defaultValue={v.social} />
        </div>
      </fieldset>

      <fieldset>
        <legend>{L.sections.offer}</legend>
        <div className="field">
          <label htmlFor="products">{L.products}</label>
          <textarea id="products" name="products" required defaultValue={v.products} {...aria("products")} />
          {err("products")}
        </div>
        <div className="field">
          <label htmlFor="target">{L.target}{opt}</label>
          <span className="hint">{L.targetHint}</span>
          <textarea id="target" name="target" rows={2} defaultValue={v.target} />
        </div>
      </fieldset>

      <fieldset>
        <legend>{L.sections.contact}</legend>
        <div className="field">
          <label htmlFor="contact_name">{L.contactName}</label>
          <input id="contact_name" name="contact_name" type="text" required autoComplete="name" defaultValue={v.contact_name} {...aria("contact_name")} />
          {err("contact_name")}
        </div>
        <p className="small muted" style={{ margin: "0 0 8px" }}>{L.contactHint}</p>
        <div className="row-2">
          <div className="field">
            <label htmlFor="whatsapp">{L.whatsapp}</label>
            <input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="099 123 4567" defaultValue={v.whatsapp} {...aria("whatsapp")} />
            {err("whatsapp")}
          </div>
          <div className="field">
            <label htmlFor="email">{L.email}</label>
            <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} {...aria("email")} />
            {err("email")}
          </div>
        </div>
        <div className="field">
          <label htmlFor="report_lang">{L.lang}</label>
          <select id="report_lang" name="report_lang" defaultValue={v.report_lang ?? lang}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="field">
          <label className="check">
            <input type="checkbox" name="consent" required {...aria("consent")} />
            <span>{L.consent} <Link href={`/${lang}/privacidad`} target="_blank">{L.privacyLink}</Link></span>
          </label>
          {err("consent")}
        </div>
      </fieldset>

      <button type="submit" className="btn btn-primary" disabled={pending} style={{ justifySelf: "start" }}>
        {pending ? L.sending : submitLabel ?? L.submit}
      </button>
    </form>
  );
}
