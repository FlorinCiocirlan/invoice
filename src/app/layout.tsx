import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Factura PFA",
  description: "Sistem de facturare pentru PFA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-[#f8f7f4]">{children}</body>
    </html>
  );
}
