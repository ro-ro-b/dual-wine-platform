import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUAL Wine Vault | Tokenised Wine Platform",
  description: "Tokenised fine wine investment, collection, and provenance on the DUAL network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
