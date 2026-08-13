import { Source_Serif_4 } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-login-serif",
  weight: ["400", "600", "700"],
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={sourceSerif.variable}>{children}</div>;
}
