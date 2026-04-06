'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    icon: '📖',
    title: 'Choose your subject',
    description: 'Pick from JavaScript, Biology, Physics, Mathematics, Chemistry or Genetics. Each subject has its own story world and characters.',
    color: '#4F9EFF',
  },
  {
    step: '02',
    icon: '🌍',
    title: 'Enter the story world',
    description: 'Biology takes you to The Living Realm. Physics puts you in The Force Fields. Every concept is wrapped in an epic narrative you will actually remember.',
    color: '#2ECC71',
  },
  {
    step: '03',
    icon: '⚡',
    title: 'Solve real challenges',
    description: 'No multiple choice. You write real code, solve real problems, answer real questions. The chapter boss will not let you pass until you truly understand.',
    color: '#FFD700',
  },
  {
    step: '04',
    icon: '🤖',
    title: 'Your AI Mentor guides you',
    description: 'Stuck? Your AI mentor gives you a personalized hint in character — Syntara for JavaScript, Vira for Biology, Newton for Physics. Never alone.',
    color: '#9B59B6',
  },
  {
    step: '05',
    icon: '🏆',
    title: 'Level up and compete',
    description: 'Earn XP, level up, unlock achievements, and join a guild. The leaderboard is waiting. Your friends are already ahead.',
    color: '#E67E22',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">How it works</span>
          <h2 className="text-4xl md:text-5xl font-black text-textPrimary mt-4 mb-6">
            Learning that feels like
            <br />
            <span className="text-primary">an adventure</span>
          </h2>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto">
            Every session is a chapter in your story. Every concept is a challenge to overcome.
            Every mistake is a lesson from your mentor.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-border to-transparent hidden md:block" />

          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                {/* Step indicator */}
                <div
                  className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2"
                  style={{
                    backgroundColor: step.color + '15',
                    borderColor: step.color + '44',
                  }}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-textMuted tracking-widest">STEP {step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-textPrimary mb-3">{step.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}