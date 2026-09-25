import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eukrasia Hajj Health — Join the waitlist",
  description:
    "Reserve early access to multilingual health and safety support for Hajj and Umrah.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
