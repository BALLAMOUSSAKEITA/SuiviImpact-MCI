import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-midnight-navy text-canvas-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
