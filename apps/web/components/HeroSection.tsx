'use client'

import { animate, motion } from 'framer-motion'
import { div, section } from 'framer-motion/client'

const SUBJECTS = [
  { label: 'JavaScript', color: '#F7DF1E' },
  { label: 'Biology', color: '#2ECC71' },
  { label: 'Physics', color: '#9B59B6' },
  { label: 'Mathematics', color: '#3498DB' },
  { label: 'Chemistry', color: '#E67E22' },
  { label: 'Genetics', color: '#E74C3C' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`,
            opacity: Math.random() * 0.6 + 0.1,
          }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-primary text-sm font-semibold mb-8"
        >
          <span>⚡</span>
          <span>Story-driven learning for the next generation</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-textPrimary leading-tight mb-6"
        >
          Learn by{' '}
          <span className="text-primary">living</span>
          <br />
          the story.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-textSecondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Lexoria turns your school subjects into epic adventures.
          Master Biology, Physics, Mathematics, Chemistry and Programming
          through immersive stories, real challenges, and an AI mentor
          that actually knows your name.
        </motion.p>

        {/* Subject pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {SUBJECTS.map((subject) => (
            <span
              key={subject.label}
              className="px-4 py-2 rounded-full text-sm font-semibold border"
              style={{ borderColor: subject.color + '66', color: subject.color }}
            >
              {subject.label}
            </span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          id="download"
        >
          <a
            href="#download"
            className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            Download Free — Android
          </a>
          <a
            href="#how-it-works"
            className="border border-border text-textSecondary px-8 py-4 rounded-xl text-lg font-medium hover:border-primary/50 hover:text-textPrimary transition-all"
          >
            See how it works →
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-textMuted text-sm mt-8"
        >
          Free to start · No credit card required · Available on Android
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-textMuted"
      >
        <span className="text-xs">Scroll to explore</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-textMuted to-transparent" />
      </motion.div>
    </section>
  )
}