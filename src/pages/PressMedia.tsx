import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Newspaper, Calendar, Award, TrendingUp, Users, Globe, ExternalLink } from 'lucide-react';

interface MediaContent {
  id: string;
  title: string;
  excerpt: string;
  publication: string;
  date: string;
  category: 'news' | 'award' | 'milestone' | 'feature';
  image: string;
  link?: string;
}

const mediaContents: MediaContent[] = [
  {
    id: '1',
    title: 'Fitinerary Revolutionizes Travel Planning with AI-Powered Personalization',
    excerpt: 'The innovative travel platform is transforming how millions of travelers plan their journeys, offering personalized itineraries that adapt to individual preferences and budgets in real-time.',
    publication: 'TechCrunch India',
    date: 'November 10, 2025',
    category: 'news',
    image: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '2',
    title: 'Best Travel Tech Startup of 2025 Award',
    excerpt: 'Fitinerary has been recognized as the Best Travel Tech Startup of 2025 by the Indian Startup Awards for its groundbreaking approach to democratizing travel planning through artificial intelligence.',
    publication: 'Indian Startup Awards',
    date: 'November 5, 2025',
    category: 'award',
    image: 'https://images.pexels.com/photos/6476776/pexels-photo-6476776.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '3',
    title: 'Fitinerary Reaches 500,000 Users Milestone',
    excerpt: 'In just six months since launch, Fitinerary has successfully onboarded over 500,000 users who have collectively created more than 2 million personalized itineraries across India and international destinations.',
    publication: 'Economic Times',
    date: 'October 28, 2025',
    category: 'milestone',
    image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '4',
    title: 'How Fitinerary is Making Travel Planning Accessible for Everyone',
    excerpt: 'A deep dive into how this Bangalore-based startup is using cutting-edge AI technology to eliminate the stress of travel planning, making it as simple as having a conversation with a knowledgeable friend.',
    publication: 'Forbes India',
    date: 'October 22, 2025',
    category: 'feature',
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '5',
    title: 'Fitinerary Partners with Major Tourism Boards Across India',
    excerpt: 'The platform announces strategic partnerships with 12 state tourism boards to promote sustainable travel and showcase hidden gems across India, bringing authentic local experiences to travelers.',
    publication: 'Travel + Leisure India',
    date: 'October 15, 2025',
    category: 'news',
    image: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '6',
    title: 'Innovation Excellence Award in Travel Technology',
    excerpt: 'Recognized by the Asia Pacific Travel Innovation Summit for exceptional innovation in applying AI to solve real-world travel challenges and creating memorable experiences for diverse travelers.',
    publication: 'APAC Travel Innovation Summit',
    date: 'October 8, 2025',
    category: 'award',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  },
  {
    id: '7',
    title: 'The Future of Travel: Inside Fitinerary\'s Vision',
    excerpt: 'An exclusive interview with the founders about their mission to democratize travel, the role of AI in creating magical travel experiences, and their ambitious plans for global expansion in 2026.',
    publication: 'Business Standard',
    date: 'September 30, 2025',
    category: 'feature',
    image: 'https://images.pexels.com/photos/3183170/pexels-photo-3183170.jpeg?auto=compress&cs=tinysrgb&w=1200',
    link: '#'
  }
];

const categoryConfig = {
  news: {
    icon: Newspaper,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'News'
  },
  award: {
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Award'
  },
  milestone: {
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Milestone'
  },
  feature: {
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Feature'
  }
};

export default function PressMedia() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-luxury-charcoal mb-4" style={{ letterSpacing: '-0.02em' }}>
            Press & Media
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest news, awards, and features about Fitinerary's journey to revolutionize travel planning
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <Users className="w-10 h-10 text-luxury-teal mx-auto mb-3" />
            <div className="text-3xl font-bold text-luxury-charcoal mb-1">500K+</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-10 h-10 text-luxury-orange mx-auto mb-3" />
            <div className="text-3xl font-bold text-luxury-charcoal mb-1">2M+</div>
            <div className="text-sm text-gray-600">Itineraries Created</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <Award className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-luxury-charcoal mb-1">5+</div>
            <div className="text-sm text-gray-600">Industry Awards</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <Globe className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-luxury-charcoal mb-1">50+</div>
            <div className="text-sm text-gray-600">Destinations Covered</div>
          </div>
        </div>

        {/* Media Content Grid */}
        <div className="space-y-8">
          {mediaContents.map((content, index) => {
            const config = categoryConfig[content.category];
            const Icon = config.icon;

            return (
              <article
                key={content.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className={`grid grid-cols-1 ${index % 2 === 0 ? 'md:grid-cols-[400px,1fr]' : 'md:grid-cols-[1fr,400px]'} gap-0`}>
                  <div className={`relative h-64 md:h-auto overflow-hidden ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <img
                      src={content.image}
                      alt={content.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-medium text-luxury-teal">{content.publication}</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{content.date}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold text-luxury-charcoal mb-4 group-hover:text-luxury-teal transition-colors duration-300 leading-tight">
                      {content.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {content.excerpt}
                    </p>

                    <a
                      href={content.link}
                      className="inline-flex items-center gap-2 text-luxury-orange font-medium group-hover:gap-3 transition-all duration-300"
                    >
                      Read Full Story
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Press Kit Section */}
        <section className="mt-20 bg-gradient-to-br from-luxury-charcoal to-gray-800 rounded-3xl p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
              Media & Press Kit
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Need high-resolution images, brand assets, or want to schedule an interview? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Newspaper className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Press Releases</h3>
              <p className="text-sm opacity-90 mb-4">Official announcements and company updates</p>
              <button className="text-luxury-teal font-medium hover:underline">Access Archive</button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Award className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Brand Assets</h3>
              <p className="text-sm opacity-90 mb-4">Logos, brand guidelines, and images</p>
              <button className="text-luxury-teal font-medium hover:underline">Download Kit</button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Users className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Media Contact</h3>
              <p className="text-sm opacity-90 mb-4">Get in touch with our media team</p>
              <a href="mailto:press@fitinerary.com" className="text-luxury-orange font-medium hover:underline">
                press@fitinerary.com
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-luxury-teal to-luxury-orange rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
            Experience the Magic Yourself
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of travelers who trust Fitinerary for their perfect journey
          </p>
          <Link
            to="/generate"
            className="inline-block bg-white text-luxury-charcoal px-8 py-4 rounded-full font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Create Your Itinerary
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
