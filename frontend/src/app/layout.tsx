import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display-serif",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Connexion — SuiviImpact | MIC Guinée",
  description:
    "Plateforme de gestion et de suivi d'impact des politiques publiques du gouvernement — Ministère de l'Industrie et du Commerce (MIC), Bureau de Stratégie et de Développement (BSD).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-graphite">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
