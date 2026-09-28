import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ubikka",
  description: "Plataforma de gestión inmobiliaria",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
