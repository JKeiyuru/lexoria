'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const FREE_FEATURES = [
  'Full JavaScript course (Season 1)',
  'Story Mode + Technical Mode',
  'In-app code editor',
  'Basic XP and levels',
  'Help Board access',
  'Guild membership',
  'AI Mentor (limited hints)',
]

const VIP_FEATURES = [
  'Everything in Free',
  'All 6 subjects unlocked',
  'Exclusive story arcs',
  'Advanced boss missions',
  'Unlimited AI Mentor hints',
  'Guild creation',
  'Exclusive avatar cosmetics',
  'Early access to new features',
  'No ads',
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-black text-textPrimary mt-4 mb-6">
            Start free.
            <br />
            <span className="text-primary">Unlock everything.</span>
          </h2>
          <p className="text-textSecondary text-lg">
            We give you the full JavaScript course for free because we believe
            you will love it enough to stay.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-8 border border-border"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-textPrimary mb-2">Free</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-textPrimary">$0</span>
                <span className="text-textMuted mb-1">forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-textSecondary text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#download"
              className="block text-center border border-border text-textSecondary py-3 rounded-xl font-semibold hover:border-primary/50 hover:text-textPrimary transition-all"
            >
              Download Free
            </a>
          </motion.div>

          {/* VIP plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-8 border-2 border-accent/50 relative overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-0 left-0 right-0 bg-accent text-black text-xs font-black text-center py-1.5 tracking-wider">
              MOST POPULAR
            </div>

            <div className="mt-6 mb-6">
              <h3 className="text-xl font-bold text-textPrimary mb-2">VIP</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-accent">$4.99</span>
                <span className="text-textMuted mb-1">/month</span>
              </div>
              <p className="text-textMuted text-xs mt-1">Cancel anytime</p>
            </div>

            <ul className="space-y-3 mb-8">
              {VIP_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-textSecondary text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#download"
              className="block text-center bg-accent text-black py-3 rounded-xl font-black hover:bg-accent/90 transition-all hover:scale-105 active:scale-95"
            >
              Get VIP Access
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}