'use client'

import { motion } from 'framer-motion'

const SUBJECTS = [
  {
    emoji: '⚡',
    name: 'JavaScript',
    world: 'The City of Logic',
    description: 'A digital city where code governs reality. Variables are memory towers. Functions are spells.',
    color: '#F7DF1E',
    free: true,
    chapters: 5,
  },
  {
    emoji: '📐',
    name: 'Mathematics',
    world: 'The Infinite Citadel',
    description: 'A fortress built on number theory. Every equation unlocks a new chamber of the citadel.',
    color: '#3498DB',
    free: false,
    chapters: 6,
  },
  {
    emoji: '🧬',
    name: 'Biology',
    world: 'The Living Realm',
    description: 'A world where organisms are characters and ecosystems are kingdoms to explore and defend.',
    color: '#2ECC71',
    free: false,
    chapters: 6,
  },
  {
    emoji: '⚛️',
    name: 'Physics',
    world: 'The Force Fields',
    description: 'A dimension where the laws of physics are literal magic spells. Newton is your battle mage.',
    color: '#9B59B6',
    free: false,
    chapters: 5,
  },
  {
    emoji: '🧪',
    name: 'Chemistry',
    world: "The Alchemist's Crucible",
    description: 'A world of elements, bonds, and reactions as powers. Every reaction is a new potion.',
    color: '#E67E22',
    free: false,
    chapters: 5,
  },
  {
    emoji: '🔬',
    name: 'Genetics',
    world: 'The Code of Life',
    description: 'A hidden layer beneath the Living Realm. DNA is the ultimate programming language.',
    color: '#E74C3C',
    free: false,
    chapters: 4,
  },
]

export function SubjectsSection() {
  return (
    <section id="subjects" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Subjects</span>
          <h2 className="text-4xl md:text-5xl font-black text-textPrimary mt-4 mb-6">
            Six worlds.
            <br />
            <span className="text-primary">One universe.</span>
          </h2>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto">
            Every subject gets its own story world, its own characters, and its own skill tree.
            JavaScript is free forever. Everything else unlocks with VIP.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface rounded-2xl p-6 border border-border hover:border-opacity-60 transition-all hover:-translate-y-1 relative overflow-hidden"
              style={{ borderColor: subject.color + '33' }}
            >
              {/* Free badge */}
              {subject.free && (
                <div className="absolute top-4 right-4 bg-success/20 border border-success/40 rounded-full px-3 py-1 text-success text-xs font-bold">
                  FREE
                </div>
              )}

              {/* Left border accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: subject.color }}
              />

              <div className="text-4xl mb-4">{subject.emoji}</div>
              <h3 className="text-xl font-bold text-textPrimary mb-1">{subject.name}</h3>
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: subject.color }}
              >
                {subject.world}
              </p>
              <p className="text-textSecondary text-sm leading-relaxed mb-4">
                {subject.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-textMuted text-xs">{subject.chapters} chapters</span>
                {!subject.free && (
                  <span className="text-accent text-xs font-bold border border-accent/30 rounded-full px-2 py-0.5">
                    VIP
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}