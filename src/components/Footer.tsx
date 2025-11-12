import { useState } from 'react';
import { MapPin, Mail, Facebook, Twitter, Instagram, Linkedin, Heart, Lightbulb, ShieldCheck, Compass, Wallet, Camera, Utensils, Map } from 'lucide-react';
import Modal from './Modal';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="bg-luxury-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-8 h-8 text-luxury-teal" />
                <h3 className="text-2xl font-light" style={{ letterSpacing: '-0.02em' }}>Fitinerary</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Your AI-powered travel companion for creating personalized, unforgettable journeys across India and beyond.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4 text-luxury-orange">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => openModal('about')}
                    className="text-gray-400 hover:text-luxury-teal transition-colors duration-300 text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a href="/press-media" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300">
                    Press & Media
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4 text-luxury-orange">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => openModal('tips')}
                    className="text-gray-400 hover:text-luxury-teal transition-colors duration-300 text-left"
                  >
                    Travel Tips & Recommendations
                  </button>
                </li>
                <li>
                  <a href="/destination-guides" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300">
                    Destination Guides
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4 text-luxury-orange">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => openModal('cookies')}
                    className="text-gray-400 hover:text-luxury-teal transition-colors duration-300 text-left"
                  >
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Fitinerary. All rights reserved. Made with <Heart className="inline w-4 h-4 text-luxury-orange" /> for travelers.
              </p>
              <div className="flex items-center gap-4">
                <Mail className="w-4 h-4 text-luxury-teal" />
                <a href="mailto:hello@fitinerary.com" className="text-gray-400 hover:text-luxury-teal transition-colors duration-300 text-sm">
                  hello@fitinerary.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Modal isOpen={activeModal === 'about'} onClose={closeModal} title="About Us">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-light text-luxury-charcoal mb-4" style={{ letterSpacing: '-0.02em' }}>
              Welcome to Fitinerary
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fitinerary is revolutionizing the way people plan and experience travel. We combine cutting-edge artificial intelligence with deep travel expertise to create personalized itineraries that perfectly match your interests, budget, and travel style.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our mission is to make travel planning effortless and enjoyable, transforming the often overwhelming task of organizing a trip into an exciting journey of discovery. Whether you're seeking adventure, relaxation, cultural immersion, or culinary experiences, Fitinerary crafts the perfect itinerary tailored just for you.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe that everyone deserves to experience the joy of perfectly planned travel, and we're committed to making that accessible through innovative technology and thoughtful design.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-2xl font-light text-luxury-charcoal mb-6" style={{ letterSpacing: '-0.02em' }}>
              Meet Our Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-luxury-teal/20 hover:border-luxury-teal/40 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-luxury-teal shadow-lg mb-4">
                    <img
                      src="/1759403490557.jpg"
                      alt="Umang Agarwalla"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-luxury-charcoal mb-1">Umang Agarwalla</h4>
                  <p className="text-luxury-teal font-medium mb-3">Business Owner</p>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                    <p>• 3PL & Supply Chain</p>
                    <p>• Industrial Consultancy</p>
                    <p>• Hospital Management</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-luxury-orange/20 hover:border-luxury-orange/40 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-luxury-orange shadow-lg mb-4">
                    <img
                      src="/Prosenjit.jpg"
                      alt="Prosanjeet Roy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-luxury-charcoal mb-1">Prosanjeet Roy</h4>
                  <p className="text-luxury-orange font-medium mb-3">Advisor & Consultant</p>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>Driving Process Excellence &</p>
                    <p>Digital Transformation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-luxury-teal/10 to-luxury-orange/10 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-luxury-charcoal mb-3">Why Choose Fitinerary?</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">✓</span>
                <span>AI-powered personalization that learns your preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">✓</span>
                <span>Comprehensive itineraries with budget options for every traveler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">✓</span>
                <span>Real-time updates and seamless modifications to your plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">✓</span>
                <span>Expert recommendations backed by extensive travel data</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'tips'} onClose={closeModal} title="Travel Tips & Recommendations">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-6 h-6 text-luxury-teal" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Best Time to Visit</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              India's diverse climate means different regions shine at different times. Plan your trips wisely:
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>North India (October to March):</strong> Perfect weather for exploring Delhi, Jaipur, and Agra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>South India (November to February):</strong> Ideal for Kerala, Goa, and Karnataka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>Hill Stations (April to June):</strong> Escape summer heat in Shimla, Manali, and Ooty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>Monsoon Magic (June to September):</strong> Experience lush landscapes in the Western Ghats</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-luxury-orange" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Smart Packing Essentials</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Pack light and versatile clothing that can be mixed and matched</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Carry a universal power adapter and portable charger</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Include basic medications, sunscreen, and insect repellent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Keep digital copies of important documents in cloud storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Bring a reusable water bottle and eco-friendly shopping bags</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-luxury-teal" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Budget Planning Tips</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Book flights and accommodations at least 2-3 months in advance for better rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Use local public transportation and ride-sharing apps to save money</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Eat at local restaurants and street food stalls for authentic, affordable meals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Set a daily spending limit and track expenses with budgeting apps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Look for free walking tours and cultural events in your destination</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-luxury-orange" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Safety Guidelines</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Share your itinerary with family and check in regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Use registered taxis or reputable ride-sharing services, especially at night</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Keep valuables secure and avoid displaying expensive items publicly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Research local customs and dress codes to respect cultural norms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Have emergency contacts saved, including local police and embassy numbers</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Utensils className="w-6 h-6 text-luxury-teal" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Food & Dining</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Start with milder dishes and gradually explore spicier options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Choose busy restaurants with high turnover for fresher food</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Drink only bottled or filtered water; avoid ice in drinks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Try regional specialties for authentic culinary experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Ask locals for restaurant recommendations for hidden gems</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-6 h-6 text-luxury-orange" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Photography Tips</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Wake up early for golden hour shots with beautiful natural lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Always ask permission before photographing people or religious sites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Capture candid moments and local life for authentic travel memories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Back up your photos daily to cloud storage or external drives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span>Put the camera down sometimes and simply enjoy the moment</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-6 h-6 text-luxury-teal" />
              <h3 className="text-xl font-semibold text-luxury-charcoal">Transportation Tips</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Download offline maps before traveling to areas with limited connectivity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Book train tickets in advance during peak travel seasons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Negotiate rickshaw and taxi fares before starting your journey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Consider overnight trains or buses to save on accommodation costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>Allow extra time for travel as delays are common in many areas</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-luxury-teal/10 to-luxury-orange/10 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed italic">
              Remember, the best travel experiences often come from being flexible, open-minded, and respectful of local cultures. Embrace the unexpected and enjoy every moment of your journey!
            </p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'cookies'} onClose={closeModal} title="Cookie Policy">
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">What Are Cookies?</h3>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our platform, and improving our services.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Why We Use Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies for several important purposes:
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>To keep you logged in and remember your preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>To understand how you interact with our platform and improve your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>To personalize content and travel recommendations based on your interests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>To analyze site performance and identify technical issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span>To ensure the security of your account and prevent fraud</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Types of Cookies We Use</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-luxury-teal mb-2">Essential Cookies</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and network management. You cannot opt out of these cookies as they are required for the platform to work.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-luxury-teal mb-2">Analytics Cookies</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve our platform, identify popular features, and optimize user experience.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-luxury-teal mb-2">Functional Cookies</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  These cookies enable enhanced functionality and personalization, such as remembering your travel preferences, language settings, and saved itineraries. They may be set by us or by third-party providers whose services we use.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-luxury-teal mb-2">Marketing Cookies</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  These cookies track your online activity to help us deliver more relevant advertising and measure the effectiveness of our marketing campaigns. They may be set by our advertising partners through our site.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Third-Party Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We work with trusted third-party service providers who may also set cookies on your device. These include:
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span><strong>Analytics providers</strong> (e.g., Google Analytics) to understand site usage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span><strong>Authentication services</strong> to manage secure logins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span><strong>Payment processors</strong> to handle secure transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-orange mt-1">•</span>
                <span><strong>Social media platforms</strong> for sharing features</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">How to Control Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the right to control how cookies are used on your device. Here are your options:
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete cookies that have already been set. Check your browser's help menu for instructions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>Opt-Out Links:</strong> You can opt out of targeted advertising through industry opt-out pages.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-luxury-teal mt-1">•</span>
                <span><strong>Privacy Settings:</strong> Adjust your privacy preferences in your account settings.</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Please note that blocking or deleting certain cookies may affect the functionality of our platform and limit your ability to use some features.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Data Retention</h3>
            <p className="text-gray-700 leading-relaxed">
              Different cookies have different lifespans. Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. We regularly review and delete cookies that are no longer necessary.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Updates to This Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We encourage you to review this policy periodically. The "Last Updated" date at the top of this page indicates when the policy was last revised.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">Contact Us</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have questions or concerns about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gradient-to-r from-luxury-teal/10 to-luxury-orange/10 rounded-xl p-4">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@fitinerary.com<br />
                <strong>Address:</strong> Fitinerary Privacy Team, India<br />
                <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
              </p>
            </div>
          </div>

          <div className="bg-luxury-charcoal text-white rounded-xl p-4 mt-6">
            <p className="text-sm leading-relaxed">
              By continuing to use Fitinerary, you acknowledge that you have read and understood this Cookie Policy and consent to our use of cookies as described herein.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
