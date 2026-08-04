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
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "SuiviImpact — MIPME BSD",
  description:
    "Plateforme de gestion et de suivi d'impact du Bureau de Suivi et de Développement",
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
