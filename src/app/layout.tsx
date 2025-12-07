import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClickPe - Loan Picks",
  description: "Find your perfect loan with AI recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
