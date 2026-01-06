import { generatePageMetadata } from '@/lib/metadata'
import Image from 'next/image'

export const metadata = generatePageMetadata({
  title: 'Our Mission - inspir | Learning is for everyone',
  description: 'At inspir, our mission is to democratize learning by making it accessible, engaging, and enjoyable for all. We believe everyone has the right to quality education.',
  keywords: ['mission', 'education for all', 'democratize learning', 'inspir mission'],
  canonical: 'https://inspir.uk/mission',
  ogImage: '/images/mission-1.jpg',
})

export default function MissionPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black mb-6 text-gradient">Our Mission</h1>
          <p className="text-xl text-gray-700">
            Learning is for everyone
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            <h2>Learning is for everyone</h2>
            <p>
              At inspir, our mission is to democratize learning by making it accessible, engaging, and enjoyable for all. We believe that everyone has the right to quality education, regardless of their background or circumstances. Our platform is designed to provide students with the tools and resources they need to succeed, while also fostering a love of learning. We strive to create a community that is inclusive, supportive, and empowering, where students can connect with each other and with educators from around the world. By making learning fun and accessible, we aim to inspir a generation of lifelong learners who are equipped to tackle the challenges of the future.
            </p>

            <div className="my-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/mission-2.jpg"
                alt="Mission Vision"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>

            <h2>The Evolution of Human Understanding</h2>
            <p>
              World History at all points of time has been like zooming out of a picture, a picture that kept changing. The centuries leading up to the 19th century marked a turning point in human history, as the world moved from a flat, limited view of the world to a growing understanding of new territories and colonies. The French Revolution marked the first time when a large population gathered to protest and establish the ideals of liberty, equality, and fraternity. The events of World War II also shaped the world for the next century and laid the foundation for the 21st century.
            </p>
            <p>
              For the first time, a former colony with no prior national history became a global power. The kings and queens of Europe were overthrown, and the United States of America emerged as a symbol of democracy, capitalism, and a free world. At the same time, a new ideology of communism emerged and the Soviet Union became its practical embodiment.
            </p>

            <h2>The Age of Connection</h2>
            <p>
              We went outside our planet. However, the most rapid and significant advancement was in communication and technology which has connected a global population of over 3 billion people.
            </p>
            <p>
              There was something the world discovered during this time, Google first showed the world the realistic application of the same. When for the first time people were identified based on behaviour and not identity. The realisation is that regardless of the identity that you subscribe to, your inherent behaviour is created by the society and environment around you.
            </p>
            <p>
              This further went on to show that oppression, wealth concentration or any other trait is present across the world. Whites oppressed blacks, Brahmins oppressed Dalits, the 1% controls more wealth than the bottom 90% almost everywhere.
            </p>

            <div className="my-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/mission-3.jpg"
                alt="Global Education"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>

            <h2>The Path Forward</h2>
            <p>
              The solution to the world&apos;s problems lies in addressing human problems, and the rise of the middle class and the world post-2008 has shown that when people are educated, sheltered, and given the freedom to make choices, they will pursue happiness and greater causes.
            </p>
            <p>
              The world must continue to evolve and learn from its mistakes, and focus on creating a high and equal quality basic environment with a focus on education, health, and individual freedom for every single person.
            </p>
            <p>
              In a world where AI is rapidly advancing, it will only be human consciousness and creativity that can survive. Albert Einstein once said, &quot;Creativity is intelligence having fun.&quot;
            </p>

            <h2>Inspiring the Future</h2>
            <p>
              Inspiring individuals to be creative and capable of withstanding the AI revolution is essential. Only by providing essential products and services for free to those who cannot afford them and sustaining access for those who can, can the world pursue happiness collectively.
            </p>
            <p className="text-xl font-bold text-inspir-purple">
              inspir wants to help in ensuring learning should be fun and for everyone.
            </p>
            <p>
              We strive for a day education reaches to everyone, everywhere through technology. Starting with the 1,415,422,077 in India.
            </p>

            <div className="my-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/mission-1.jpg"
                alt="Learning for Everyone"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
