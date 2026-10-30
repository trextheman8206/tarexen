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

export function StatusBadge({ status }: { status: string }) {
  const [label, cls] = STATUS_LABEL[status] ?? [status, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function statusLabel(status: string) {
  return STATUS_LABEL[status]?.[0] ?? status;
}

const APPEARED: Record<string, [string, string]> = {
  si: ["Sí aparece", "badge-ok"],
  parcial: ["Parcial / mal descrito", "badge-warn"],
  no: ["No aparece", "badge-danger"],
};

export function AppearedBadge({ value }: { value: string }) {
  const [label, cls] = APPEARED[value] ?? [value, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export const KIND_LABEL: Record<string, string> = { snapshot: "Snapshot gratis", full: "Auditoría completa", followup: "Re-medición" };
