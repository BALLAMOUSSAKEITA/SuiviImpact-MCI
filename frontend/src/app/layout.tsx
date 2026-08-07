import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-graphite">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
