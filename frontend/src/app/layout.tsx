import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Connexion — SuiviImpact | MCI Guinée",
  description:
    "Plateforme de suivi d'impact du Ministère du Commerce et de l'Industrie — Bureau de Stratégie et de Développement (BSD).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas-white text-charcoal">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
