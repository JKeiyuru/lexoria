'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const STORY_CONTENT = {
  scene: 'You arrive at the gates of the City of Logic. The streets are silent. Citizens wander aimlessly — they\'ve forgotten their own names. The city\'s Memory Towers have gone dark.',
  dialogue: [
    { character: 'Elder Syntax', text: 'A variable is like a named box. You give it a name, and you put something inside it. That\'s all memory is — a name and a value.' },
    { character: 'You', text: 'So if I write: let cityName = \'Logic City\' — the city remembers its name?' },
    { character: 'Elder Syntax', text: 'Exactly. \'let\' creates the box. \'cityName\' is the label. \'Logic City\' is what\'s inside. Simple. Powerful.' },
  ],
}

const TECHNICAL_CONTENT = {
  explanation: 'Variables are containers for storing data values. In JavaScript, you declare variables using let, const, or var.',
  example: `let cityName = 'Logic City';
let population = 10000;
const MAX_TOWERS = 5;

console.log(cityName);    // Logic City
console.log(population);  // 10000`,
}

export function DemoSection() {
  const [mode, setMode] = useState<'STORY' | 'TECHNICAL'>('STORY')

  return (
    <section className="py-24 px-6 bg-surface/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Live Preview</span>
          <h2 className="text-4xl md:text-5xl font-black text-textPrimary mt-4 mb-6">
            See a real
            <br />
            <span className="text-primary">chapter in action</span>
          </h2>
          <p className="text-textSecondary text-lg">
            This is an actual chapter from JavaScript Season 1.
            Toggle between Story Mode and Technical Mode.
          </p>
        </motion.div>

        {/* Chapter card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface rounded-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-card px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">JavaScript · Season 1</p>
                <h3 className="text-textPrimary font-bold text-lg">Chapter 1: The City Without Memory</h3>
              </div>
              <div className="bg-accent/20 border border-accent/40 rounded-full px-3 py-1 text-accent text-xs font-bold">
                +100 XP
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex border-b border-border">
            {(['STORY', 'TECHNICAL'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  mode === m
                    ? 'text-primary bg-primary/10 border-b-2 border-primary'
                    : 'text-textMuted hover:text-textSecondary'
                }`}
              >
                {m === 'STORY' ? '📖 Story Mode' : '⚙️ Technical Mode'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {mode === 'STORY' ? (
              <div className="space-y-4">
                <div className="bg-background/60 rounded-xl p-4 border border-border">
                  <p className="text-textSecondary leading-relaxed text-sm">{STORY_CONTENT.scene}</p>
                </div>
                {STORY_CONTENT.dialogue.map((line, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border-l-4 ${
                      line.character === 'You'
                        ? 'bg-primary/5 border-primary'
                        : 'bg-background/60 border-border'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-textMuted">
                      {line.character}
                    </p>
                    <p className="text-textPrimary text-sm leading-relaxed">{line.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-textSecondary leading-relaxed text-sm">
                  {TECHNICAL_CONTENT.explanation}
                </p>
                <div className="bg-[#0D1117] rounded-xl p-4 border border-border">
                  <p className="text-xs text-textMuted mb-3 font-mono">javascript</p>
                  <pre className="text-[#E6EDF3] font-mono text-sm leading-relaxed overflow-x-auto">
                    {TECHNICAL_CONTENT.example}
                  </pre>
                </div>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Key Point</p>
                  <p className="text-textSecondary text-sm">
                    Use <code className="text-primary bg-primary/10 px-1 rounded">const</code> when the value never changes.
                    Use <code className="text-primary bg-primary/10 px-1 rounded">let</code> when it might.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Challenge preview */}
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-textPrimary font-bold">Try the challenge</h4>
              <span className="text-accent text-xs font-bold border border-accent/30 rounded-full px-2 py-0.5">+20 XP</span>
            </div>
            <div className="bg-background/60 rounded-xl p-4 border border-border mb-4">
              <p className="text-textSecondary text-sm">
                Create a variable called <code className="text-primary bg-primary/10 px-1 rounded">cityName</code> and assign it the value{' '}
                <code className="text-primary bg-primary/10 px-1 rounded">'Logic City'</code>.
                Then log it to the console.
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-4 border border-border text-center">
              <p className="text-textMuted text-sm">
                💻 Download the app to write and run your code
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}