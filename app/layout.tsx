import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eukrasia | Your health, understood",
  icons: { icon: "/eukrasia-original-mark.png" },
  description:
    "Join the Eukrasia waitlist. A thoughtful health companion being built to help you understand how you feel and feel more prepared for your next step in care.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
