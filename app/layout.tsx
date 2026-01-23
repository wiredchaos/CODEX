import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const appSans = Inter({ subsets: ["latin"], variable: "--font-app-sans" })
const appMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-app-mono" })

export const metadata: Metadata = {
  title: "Blocks SOTD — Editorial WebGPU Experience",
  description: "Minimalist, editorial SOTD concept built on Three.js Blocks with WebGPU-first rendering.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/placeholder-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${appSans.variable} ${appMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
