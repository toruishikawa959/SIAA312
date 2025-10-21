import type React from "react"
import type { Metadata } from "next"
import { Merriweather, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Sierbosten Literature Collective",
  description: "Stories That Matter - Independent Publishing & Literature",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
