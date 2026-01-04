import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope'
})

export const metadata: Metadata = {
  title: 'Townin OS - Personalized Flyers',
  description: 'Hyper-local Life Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} font-sans bg-[#11221e] text-white antialiased`}>{children}</body>
    </html>
  )
}
