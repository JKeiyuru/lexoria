export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-black text-textPrimary tracking-wider">LEXORIA</span>
            </div>
            <p className="text-textSecondary text-sm leading-relaxed">
              Learn by living the story. An immersive, story-driven learning platform
              for the next generation of thinkers.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-textPrimary font-bold text-sm mb-4">Platform</h4>
              <ul className="space-y-2">
                {['How it Works', 'Subjects', 'Pricing', 'Download'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-textSecondary text-sm hover:text-textPrimary transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-textPrimary font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-textSecondary text-sm hover:text-textPrimary transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-textMuted text-sm">
            © {new Date().getFullYear()} Lexoria. All rights reserved.
          </p>
          <p className="text-textMuted text-sm">
            Made with ❤️ for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}