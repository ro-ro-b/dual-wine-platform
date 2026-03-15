import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUAL Wine Vault | Tokenised Wine Platform",
  description: "Tokenised fine wine investment, collection, and provenance on the DUAL network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
