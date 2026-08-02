import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal Document Creator",
  description:
    "Chat with an AI to generate a downloadable Common Paper legal document.",
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
