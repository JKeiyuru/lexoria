import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lexoria — Learn by Living the Story',
  description: 'An immersive, story-driven learning platform for Mathematics, Biology, Physics, Chemistry, Genetics and Programming. Made for teens who want to actually understand.',
  keywords: ['education', 'learning', 'gamification', 'biology', 'mathematics', 'physics', 'programming'],
  openGraph: {
    title: 'Lexoria — Learn by Living the Story',
    description: 'Story-driven learning across all your school subjects.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-textPrimary antialiased">
        {children}
      </body>
    </html>
  )
}