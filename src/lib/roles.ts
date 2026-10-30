// Roles del equipo y qué puede hacer cada uno. Para cambiar permisos, edita MATRIX.

export const ROLES = ["dueno", "gerente", "auditor", "ventas", "lectura"] as const;
export type Role = (typeof ROLES)[number];

/** Roles que se pueden asignar por invitación (el dueño no se invita). */
export const INVITABLE_ROLES: Role[] = ["gerente", "auditor", "ventas", "lectura"];

export const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  dueno: { label: "Dueño", description: "Acceso total, incluido el equipo y las integraciones." },
  gerente: { label: "Gerente", description: "Todo el trabajo diario: negocios, auditorías, pagos y categorías. No gestiona el equipo." },
  auditor: { label: "Auditor", description: "Hace auditorías: registra consultas, checklist y recomendaciones, y ve informes. No ve pagos." },
  ventas: { label: "Ventas", description: "Gestiona leads: estado, notas y contacto. Ve informes, pero no edita auditorías ni ve pagos." },
  lectura: { label: "Solo lectura", description: "Puede ver negocios e informes. No puede cambiar nada." },
};

export type Perm =
  | "leads.view"
  | "leads.edit"
  | "payments.manage"
  | "audits.edit"
  | "reports.view"
  | "categories.manage"
  | "team.manage"
  | "integrations.view"
  | "demo.create";

const ALL: Perm[] = [
  "leads.view", "leads.edit", "payments.manage", "audits.edit", "reports.view",
  "categories.manage", "team.manage", "integrations.view", "demo.create",
];

const MATRIX: Record<Role, Perm[]> = {
  dueno: ALL,
  gerente: ["leads.view", "leads.edit", "payments.manage", "audits.edit", "reports.view", "categories.manage", "demo.create"],
  auditor: ["leads.view", "audits.edit", "reports.view"],
  ventas: ["leads.view", "leads.edit", "reports.view"],
  lectura: ["leads.view", "reports.view"],
};

export function can(role: Role, perm: Perm): boolean {
  return MATRIX[role].includes(perm);
}

export function isRole(v: string): v is Role {
  return (ROLES as readonly string[]).includes(v);
}
