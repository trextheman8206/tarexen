import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <nav className="admin-side" aria-label="Panel">
        <Link href="/admin" className="logo"><span className="logo-mark" aria-hidden="true">✦</span> TAREXEN</Link>
        <Link href="/admin">Resumen</Link>
        <Link href="/admin/negocios">Negocios y leads</Link>
        <Link href="/admin/categorias">Categorías</Link>
        <Link href="/admin/integraciones">Integraciones</Link>
        <Link href="/es" target="_blank">Ver sitio ↗</Link>
        <form action={logout}><button className="btn btn-ghost btn-sm" style={{ color: "#fff", borderColor: "#44524f" }}>Salir</button></form>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
