import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "House Hunt HK",
  description: "Discovery Bay Property Tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
