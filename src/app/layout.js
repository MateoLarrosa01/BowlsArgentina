import { Geist, Geist_Mono } from "next/font/google";
import { CabeceraSitio } from "@/components/cabecera-sitio";
import { PieSitio } from "@/components/pie-sitio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Bowls Argentina",
    template: "%s · Bowls Argentina",
  },
  description:
    "Plataforma para torneos de Bowls Argentina: gestión para la federación y consulta pública de fixture y tablas.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <CabeceraSitio />
        <main className="flex-1">{children}</main>
        <PieSitio />
      </body>
    </html>
  );
}
