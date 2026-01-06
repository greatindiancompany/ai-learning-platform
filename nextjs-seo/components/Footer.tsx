import Link from 'next/link'
import { Sparkles, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: '15 Study Tools', href: '/tools' },
      { name: 'AI Tutor', href: '/chat' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Blog', href: '/blog' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR Compliance', href: '/gdpr' },
    ],
    resources: [
      { name: 'Study Guides', href: '/blog/category/study-skills' },
      { name: 'Exam Prep', href: '/blog/category/exam-prep' },
      { name: 'Tool Tutorials', href: '/blog/category/tool-guides' },
      { name: 'Help Center', href: '/help' },
    ],
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-inspir-purple to-inspir-blue rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-inspir-purple to-inspir-blue bg-clip-text text-transparent">
                inspir
              </span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-xs">
              The AI-powered study platform helping students achieve academic excellence with 15 revolutionary learning tools.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/inspir.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-inspir-purple hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/inspir.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-inspir-purple hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/inspiruk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-inspir-purple hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/inspiruk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-inspir-purple hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-inspir-purple transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-inspir-purple transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Legal & Compliance
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-inspir-purple transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Company Info & Copyright */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="font-semibold text-gray-900">Inspir Learning Ltd</p>
              <p>Registered and operating in the United Kingdom</p>
              <p className="mt-1">
                © {currentYear} Inspir Learning Ltd. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-inspir-purple">
                Privacy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms" className="hover:text-inspir-purple">
                Terms
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/cookies" className="hover:text-inspir-purple">
                Cookies
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/gdpr" className="hover:text-inspir-purple">
                GDPR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
