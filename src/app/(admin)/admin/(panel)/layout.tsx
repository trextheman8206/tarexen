import { adminT } from "@/lib/admin-i18n";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can, ROLE_INFO } from "@/lib/roles";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const T = await adminT();
  const user = await requireUser();
  return (
    <div className="admin-shell">
      <nav className="admin-side" aria-label="Panel">
        <Link href="/admin" className="logo"><span className="logo-mark" aria-hidden="true">✦</span> TAREXEN</Link>
        <Link href="/admin">{T("Resumen")}</Link>
        {can(user.role, "leads.view") && <Link href="/admin/negocios">{T("Negocios y leads")}</Link>}
        {can(user.role, "categories.manage") && <Link href="/admin/categorias">{T("Categorías")}</Link>}
        {can(user.role, "team.manage") && <Link href="/admin/equipo">{T("Equipo")}</Link>}
        {can(user.role, "integrations.view") && <Link href="/admin/integraciones">{T("Integraciones")}</Link>}
        <Link href="/es" target="_blank">{T("Ver sitio ↗")}</Link>
        <form action={logout} className="admin-user">
          <span className="small" style={{ color: "#9fb0ad" }}>{user.name} · {T(ROLE_INFO[user.role].label)}</span>
          <button className="btn btn-ghost btn-sm" style={{ color: "#fff", borderColor: "#44524f" }}>{T("Salir")}</button>
        </form>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
