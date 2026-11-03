import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";
import { adminLang } from "@/lib/admin-i18n";

export const metadata: Metadata = {
  title: { default: "Panel · TAREXEN", template: "%s · Panel TAREXEN" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await adminLang();
  return (
    <html lang={lang === "en" ? "en" : "es-EC"}>
      <body className="admin">{children}</body>
    </html>
  );
}
