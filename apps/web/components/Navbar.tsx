'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-surface/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-black text-textPrimary tracking-wider">LEXORIA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How it Works', href: '#how-it-works' },
            { label: 'Subjects', href: '#subjects' },
            { label: 'Pricing', href: '#pricing' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-textSecondary hover:text-textPrimary transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="#download"
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-700 hover:bg-primary/90 transition-colors font-bold"
          >
            Download App
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-textSecondary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-4">
          {[
            { label: 'How it Works', href: '#how-it-works' },
            { label: 'Subjects', href: '#subjects' },
            { label: 'Pricing', href: '#pricing' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-textSecondary text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#download"
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold text-center"
            onClick={() => setMenuOpen(false)}
          >
            Download App
          </Link>
        </div>
      )}
    </nav>
  )
}