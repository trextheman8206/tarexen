import type { Metadata } from "next";
import { CONSENT_VERSION, SITE } from "@/config/site";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Privacidad / Privacy" };

// BORRADOR — debe revisarlo un abogado ecuatoriano antes de operar con clientes.
export default async function PrivacyPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const contact = SITE.email || (lang === "es" ? "el email de contacto publicado en este sitio" : "the contact email published on this site");

  if (lang === "en") {
    return (
      <section className="section">
        <div className="container prose">
          <h1>Privacy policy</h1>
          <p className="muted small">Version {CONSENT_VERSION}. Ecuador&apos;s Organic Law on Personal Data Protection (LOPDP, 2021) and its Regulation apply.</p>
          <h2>Who is responsible</h2>
          <p>TAREXEN (Ecuador) is responsible for the data you submit on this site. Contact: {contact}.</p>
          <h2>What we collect</h2>
          <ul>
            <li>Data you give us: business name, category, location, website and profile links, products or services, your name, email and/or WhatsApp.</li>
            <li>Public information about your business (Google profile, website, reviews, directories) and answers from AI assistants to questions about your category and city.</li>
          </ul>
          <h2>Why</h2>
          <p>Only to prepare your visibility audit, contact you about it and, if you hire us, deliver the service. We don&apos;t sell your data or use it for third-party advertising.</p>
          <h2>Legal basis</h2>
          <p>Your explicit consent, given in the form, and — if you hire us — the performance of the contract.</p>
          <h2>Retention</h2>
          <p>Leads that don&apos;t become clients are deleted after 12 months. Client data is kept as long as tax law requires.</p>
          <h2>Your rights</h2>
          <p>You can request access, correction, deletion, objection or portability of your data, or withdraw consent, by writing to {contact}. We answer within the legal timeframes.</p>
          <h2>Service providers</h2>
          <p>We use outside providers only to run the service: web hosting (Netlify), database (Turso) and email alerts to our team (Resend). Some process data outside Ecuador.</p>
          <h2>Security</h2>
          <p>Data is stored in a database with restricted access. We never ask for your Google password: changes to your profile only happen if you add us as a manager.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container prose">
        <h1>Política de privacidad</h1>
        <p className="muted small">Versión {CONSENT_VERSION}. Aplica la Ley Orgánica de Protección de Datos Personales (LOPDP, 2021) y su Reglamento.</p>
        <h2>Responsable</h2>
        <p>TAREXEN (Ecuador) es responsable de los datos que envías en este sitio. Contacto: {contact}.</p>
        <h2>Qué datos recogemos</h2>
        <ul>
          <li>Los que nos das: nombre del negocio, categoría, ubicación, enlaces a tu web y perfiles, productos o servicios, tu nombre, email y/o WhatsApp.</li>
          <li>Información pública de tu negocio (ficha de Google, web, reseñas, directorios) y respuestas de asistentes de IA a preguntas sobre tu categoría y ciudad.</li>
        </ul>
        <h2>Para qué</h2>
        <p>Solo para preparar tu análisis de visibilidad, contactarte sobre él y, si nos contratas, prestar el servicio. No vendemos tus datos ni los usamos para publicidad de terceros.</p>
        <h2>Base legal</h2>
        <p>Tu consentimiento explícito, dado en el formulario, y —si nos contratas— la ejecución del contrato.</p>
        <h2>Conservación</h2>
        <p>Los datos de quienes no se convierten en clientes se eliminan a los 12 meses. Los de clientes se conservan lo que exija la normativa tributaria.</p>
        <h2>Tus derechos</h2>
        <p>Puedes pedir acceso, rectificación, eliminación, oposición o portabilidad de tus datos, o retirar tu consentimiento, escribiendo a {contact}. Respondemos en los plazos que fija la ley.</p>
        <h2>Proveedores</h2>
        <p>Usamos proveedores externos solo para operar el servicio: alojamiento web (Netlify), base de datos (Turso) y envío de avisos por email al equipo (Resend). Algunos procesan datos fuera de Ecuador.</p>
        <h2>Seguridad</h2>
        <p>Los datos se guardan en una base de datos con acceso restringido. Nunca pedimos tu contraseña de Google: los cambios en tu ficha solo se hacen si nos agregas como administrador.</p>
      </div>
    </section>
  );
}
