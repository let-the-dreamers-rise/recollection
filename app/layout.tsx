import type { Metadata } from "next";
import "./globals.css";
import "./compat.css";

export const metadata: Metadata = {
  title: "Recollection - Meet them when they were you",
  description: "A private age chain that connects your life now with someone you love at the same age.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
