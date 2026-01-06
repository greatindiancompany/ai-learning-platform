import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { generateProductSchema } from '@/lib/structured-data'
import StructuredData from '@/components/seo/StructuredData'
import { Check, Users, GraduationCap, Building2, Sparkles } from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'Pricing - Simple, Fair, Unlimited',
  description: 'One simple price: £6.99 per profile. Everything unlimited. No hidden fees, no tiers, no limits. Perfect for students, parents, and schools.',
  keywords: ['pricing', 'per profile pricing', 'student pricing', 'AI tutor pricing', 'family pricing'],
  canonical: 'https://inspir.uk/pricing',
  ogImage: '/assets/og-images/pricing-og.png',
})

export default function PricingPage() {
  const colorClasses = {
    purple: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white',
    green: 'bg-gradient-to-br from-green-500 to-teal-500 text-white',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
  }

  const useCases = [
    {
      icon: Users,
      title: 'Parents',
      example: '2 kids?',
      price: '£13.98/month',
      description: 'Separate profiles for each child',
      color: 'purple' as const,
    },
    {
      icon: GraduationCap,
      title: 'Students',
      example: 'Just you?',
      price: '£6.99/month',
      description: 'One profile, unlimited everything',
      color: 'blue' as const,
    },
    {
      icon: Building2,
      title: 'Schools',
      example: '30 students?',
      price: 'Contact us',
      description: 'Volume pricing available',
      color: 'green' as const,
    },
    {
      icon: Sparkles,
      title: 'Families',
      example: '5 members?',
      price: '£34.95/month',
      description: 'Everyone gets their own space',
      color: 'amber' as const,
    },
  ]

  const features = [
    'All 15 AI-powered study tools',
    'Unlimited AI tutoring with Claude Sonnet 4.5',
    'Unlimited messages & conversations',
    'Quiz generator & flashcards',
    'Study timer & habit tracker',
    'Visual learning & diagram tools',
    'Math solver with step-by-step solutions',
    'Practice tests & image analysis',
    'Notes sync & AI planner',
    'Priority support',
    'No hidden fees or limits',
    'Cancel anytime',
  ]

  return (
    <>
      <StructuredData data={generateProductSchema()} />

      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {/* Hero */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="text-gradient">One Simple Price</span>
            </h1>
            <div className="mb-8">
              <div className="text-7xl sm:text-8xl font-black text-gray-900 mb-2">£6.99</div>
              <p className="text-2xl text-gray-700">per profile, per month</p>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              No tiers. No limits. No hidden fees. Just pure unlimited learning for everyone.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-center mb-4">Perfect For Everyone</h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Pay only for the profiles you need
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border-2 border-gray-200">
                    <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${colorClasses[useCase.color]}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                    <p className="text-gray-600 mb-2">{useCase.example}</p>
                    <p className="text-2xl font-black text-gray-900 mb-2">{useCase.price}</p>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Everything Included */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-4">Everything Included</h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Every profile gets unlimited access to all features
            </p>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {[
                {
                  q: 'How does per-profile pricing work?',
                  a: 'Each student or family member gets their own profile for £6.99/month. Each profile has unlimited access to all 15 tools, unlimited AI messages, and all premium features.',
                },
                {
                  q: 'Can I start with one profile and add more later?',
                  a: 'Absolutely! Start with one profile and add more anytime. You only pay for active profiles, and you can add or remove profiles whenever you need.',
                },
                {
                  q: 'Is there really no usage limit?',
                  a: 'Correct! Every profile gets unlimited AI messages, unlimited tool access, and unlimited conversations. No daily limits, no throttling, no restrictions.',
                },
                {
                  q: 'What if I have a large family or classroom?',
                  a: "For 10+ profiles, contact us for volume pricing. We offer special rates for schools, tutoring centers, and large families.",
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes! Cancel anytime with one click. No questions asked, no cancellation fees. Your profiles remain active until the end of your billing period.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and PayPal.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <h3 className="text-xl font-bold mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-4 opacity-90">
              Start with one profile. Add more as you grow.
            </p>
            <p className="text-2xl font-bold mb-8">
              £6.99 per profile. Everything unlimited.
            </p>
            <Link
              href="/chat"
              className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-2xl"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
