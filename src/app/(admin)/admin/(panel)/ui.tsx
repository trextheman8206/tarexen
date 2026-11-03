import { adminT } from "@/lib/admin-i18n";
import { setAdminLangAction } from "../actions";

const STATUS_LABEL: Record<string, [string, string]> = {
  nuevo: ["Nuevo", "badge-brand"],
  contactado: ["Contactado", ""],
  snapshot_enviado: ["Snapshot enviado", ""],
  propuesta: ["Propuesta", "badge-warn"],
  cliente: ["Cliente", "badge-ok"],
  perdido: ["Perdido", "badge-danger"],
  borrador: ["Borrador", ""],
  en_progreso: ["En progreso", "badge-warn"],
  completada: ["Completada", "badge-ok"],
};

export async function StatusBadge({ status }: { status: string }) {
  const T = await adminT();
  const [label, cls] = STATUS_LABEL[status] ?? [status, ""];
  return <span className={`badge ${cls}`}>{T(label)}</span>;
}

/** Texto en español; pásalo por T() al mostrarlo. */
export function statusLabel(status: string) {
  return STATUS_LABEL[status]?.[0] ?? status;
}

const APPEARED: Record<string, [string, string]> = {
  si: ["Sí aparece", "badge-ok"],
  parcial: ["Parcial / mal descrito", "badge-warn"],
  no: ["No aparece", "badge-danger"],
};

export async function AppearedBadge({ value }: { value: string }) {
  const T = await adminT();
  const [label, cls] = APPEARED[value] ?? [value, ""];
  return <span className={`badge ${cls}`}>{T(label)}</span>;
}

/** Botón para cambiar el idioma del panel. Muestra el otro idioma, escrito en ese idioma. */
export async function AdminLangToggle() {
  const T = await adminT();
  const other = T.lang === "en" ? "es" : "en";
  return (
    <form action={setAdminLangAction}>
      <input type="hidden" name="lang" value={other} />
      <button className="btn btn-ghost btn-sm" lang={other} aria-label={other === "en" ? "Switch the panel to English" : "Cambiar el panel a español"}>
        <span aria-hidden="true">🌐</span> {other === "en" ? "English" : "Español"}
      </button>
    </form>
  );
}

/** Textos en español; pásalos por T() al mostrarlos. */
export const KIND_LABEL: Record<string, string> = { snapshot: "Snapshot gratis", full: "Auditoría completa", followup: "Re-medición" };
