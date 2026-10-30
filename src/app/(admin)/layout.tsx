import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Panel · TAREXEN", template: "%s · Panel TAREXEN" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-EC">
      <body className="admin">{children}</body>
    </html>
  );
}
