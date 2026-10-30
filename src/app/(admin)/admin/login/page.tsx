import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <div className="card">
        <div className="logo" style={{ marginBottom: 16 }}>
          <span className="logo-mark" aria-hidden="true">✦</span> TAREXEN <small>Panel</small>
        </div>
        {!adminConfigured() && (
          <p className="alert alert-warn small">
            Panel sin configurar. Define <code>ADMIN_PASSWORD</code> y <code>SESSION_SECRET</code> (32+ caracteres) en <code>.env.local</code> y reinicia el servidor.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
