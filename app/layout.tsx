import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIRED CHAOS Intake Protocol",
  description: "3DT job intake and live status console"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
