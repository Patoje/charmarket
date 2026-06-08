import type { Metadata, Viewport } from "next";
import { Cinzel, Raleway } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Charmarket - TCG Store",
  description: "La mejor tienda de cartas coleccionables y TCG",
};

export const viewport: Viewport = {
  themeColor: "#1a0f06",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${raleway.variable} h-full antialiased dark overflow-x-hidden`}
      suppressHydrationWarning
    >
      {/* FORZADO A MODO OSCURO: Por decisión de marca (Estética Charmander) no se soporta modo claro */}
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden" suppressHydrationWarning>
        {/* Skip Link para accesibilidad */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-primary focus:top-0 focus:left-0"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
