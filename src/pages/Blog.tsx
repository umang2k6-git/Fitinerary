import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  location: string;
  date: string;
  readTime: string;
  image: string;
  category: 'india' | 'international';
}

const blogPosts: BlogPost[] = [
  // India blogs
  {
    id: '1',
    title: 'Discovering the Hidden Gems of Rajasthan',
    excerpt: 'Journey through the royal state of Rajasthan, exploring ancient forts, vibrant markets, and the warm hospitality of desert communities. From the pink city of Jaipur to the golden sands of Jaisalmer.',
    location: 'Rajasthan, India',
    date: 'November 8, 2025',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'india'
  },
  {
    id: '2',
    title: 'Spiritual Awakening in Varanasi',
    excerpt: 'Experience the spiritual heart of India on the ghats of Varanasi. Witness ancient rituals, sunrise boat rides on the Ganges, and immerse yourself in a city that has remained unchanged for millennia.',
    location: 'Varanasi, India',
    date: 'November 5, 2025',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/1542620/pexels-photo-1542620.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'india'
  },
  {
    id: '3',
    title: 'Kerala Backwaters: A Tranquil Escape',
    excerpt: 'Float through the serene backwaters of Kerala on traditional houseboats. Discover lush landscapes, authentic village life, and the unique culinary traditions of God\'s Own Country.',
    location: 'Kerala, India',
    date: 'November 2, 2025',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/2082949/pexels-photo-2082949.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'india'
  },
  {
    id: '4',
    title: 'Himalayan Adventures in Ladakh',
    excerpt: 'Trek through the stark beauty of Ladakh, where monasteries cling to mountainsides and pristine lakes reflect snow-capped peaks. An adventure into one of the world\'s most dramatic landscapes.',
    location: 'Ladakh, India',
    date: 'October 28, 2025',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/1125272/pexels-photo-1125272.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'india'
  },
  {
    id: '5',
    title: 'Goa: Beyond the Beaches',
    excerpt: 'Explore the lesser-known side of Goa, from Portuguese heritage sites to spice plantations and hidden waterfalls. Discover why this coastal paradise offers much more than sun and sand.',
    location: 'Goa, India',
    date: 'October 25, 2025',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'india'
  },
  // International blogs
  {
    id: '6',
    title: 'Chasing Northern Lights in Iceland',
    excerpt: 'Experience the magic of Iceland\'s winter wonderland, from the dancing aurora borealis to geothermal hot springs and dramatic volcanic landscapes. A journey to the land of fire and ice.',
    location: 'Iceland',
    date: 'October 22, 2025',
    readTime: '9 min read',
    image: 'https://images.pexels.com/photos/2480074/pexels-photo-2480074.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'international'
  },
  {
    id: '7',
    title: 'Tokyo: Where Tradition Meets Future',
    excerpt: 'Navigate the fascinating contrasts of Tokyo, from ancient temples and traditional tea ceremonies to futuristic technology and vibrant street culture. A city that honors its past while embracing tomorrow.',
    location: 'Tokyo, Japan',
    date: 'October 18, 2025',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'international'
  },
  {
    id: '8',
    title: 'Swiss Alps: A Mountain Paradise',
    excerpt: 'Journey through the breathtaking Swiss Alps, discovering charming villages, pristine mountain lakes, and world-class hiking trails. Experience the perfect blend of natural beauty and Swiss hospitality.',
    location: 'Swiss Alps, Switzerland',
    date: 'October 15, 2025',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'international'
  },
  {
    id: '9',
    title: 'Exploring Ancient Petra',
    excerpt: 'Walk through the rose-red city of Petra, one of the world\'s most iconic archaeological sites. Discover the fascinating history of the Nabataeans and marvel at temples carved into sandstone cliffs.',
    location: 'Petra, Jordan',
    date: 'October 12, 2025',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/4350056/pexels-photo-4350056.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'international'
  }
];

export default function Blog() {
  const indiaPosts = blogPosts.filter(post => post.category === 'india');
  const internationalPosts = blogPosts.filter(post => post.category === 'international');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-luxury-charcoal mb-4" style={{ letterSpacing: '-0.02em' }}>
            Travel Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Inspiration from around the world and across India
          </p>
        </div>

        {/* India Section */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-light text-luxury-charcoal" style={{ letterSpacing: '-0.02em' }}>
              Explore India
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-luxury-teal to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {indiaPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.location}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-luxury-charcoal mb-3 group-hover:text-luxury-teal transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-luxury-teal font-medium group-hover:gap-3 transition-all duration-300">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* International Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-light text-luxury-charcoal" style={{ letterSpacing: '-0.02em' }}>
              International Adventures
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-luxury-orange to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {internationalPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.location}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-luxury-charcoal mb-3 group-hover:text-luxury-orange transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-luxury-orange font-medium group-hover:gap-3 transition-all duration-300">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-luxury-teal to-luxury-orange rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
            Ready to Create Your Own Story?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Let our AI craft the perfect itinerary for your next adventure
          </p>
          <Link
            to="/generate"
            className="inline-block bg-white text-luxury-charcoal px-8 py-4 rounded-full font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Planning Your Trip
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
