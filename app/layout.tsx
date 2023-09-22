import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// import { SnackbarProvider } from "notistack"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GPT LANG - AI 기반 영어 교정 토탈 솔루션",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* <SnackbarProvider> */}
      <body className={inter.className}>{children}</body>
      {/* </SnackbarProvider> */}
    </html>
  )
}
