import { Newsreader, Source_Sans_3 } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-login-display",
  weight: ["400", "500", "600"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-login-sans",
  weight: ["400", "500", "600", "700"],
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${newsreader.variable} ${sourceSans.variable}`}>{children}</div>
  );
}
