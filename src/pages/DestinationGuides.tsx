import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Plane,
  Calendar,
  Phone,
  Zap,
  AlertCircle,
  Utensils,
  Home,
  Car
} from 'lucide-react';

interface DestinationGuide {
  id: string;
  name: string;
  image: string;
  description: string;
  bestTimeToVisit: string;
  currency: string;
  language: string;
  timeZone: string;
  visaRequirements: string;
  topAttractions: string[];
  travelTips: string[];
  foodCulture: string;
  transportation: string;
  emergency: string;
  budgetEstimate: string;
}

const destinationGuides: DestinationGuide[] = [
  {
    id: 'usa',
    name: 'United States',
    image: 'https://images.pexels.com/photos/64271/queen-of-liberty-statue-of-liberty-new-york-liberty-statue-64271.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'From the iconic skylines of New York to the natural wonders of the Grand Canyon, the USA offers diverse experiences spanning vibrant cities, stunning national parks, and rich cultural heritage.',
    bestTimeToVisit: 'April to June, September to November (varies by region)',
    currency: 'US Dollar (USD)',
    language: 'English',
    timeZone: 'Multiple (EST, CST, MST, PST)',
    visaRequirements: 'Visa required for most nationalities. ESTA available for eligible countries.',
    topAttractions: [
      'Statue of Liberty & New York City',
      'Grand Canyon National Park',
      'Golden Gate Bridge, San Francisco',
      'Disney World & Universal Studios, Florida',
      'Yellowstone National Park',
      'Las Vegas Strip',
      'Washington D.C. Monuments',
      'Hawaii Beaches'
    ],
    travelTips: [
      'Tips are customary (15-20%) in restaurants and for services',
      'Book internal flights in advance for better rates',
      'Rent a car for exploring outside major cities',
      'Purchase travel insurance for medical coverage',
      'Download ride-sharing apps like Uber and Lyft',
      'Keep identification handy at all times',
      'Book popular attractions and tours in advance'
    ],
    foodCulture: 'Diverse cuisine reflecting multicultural heritage. Must-try: Burgers, BBQ, New York pizza, Tex-Mex, soul food, and regional specialties.',
    transportation: 'Extensive domestic flight network, rental cars widely available, public transit in major cities, ride-sharing apps common.',
    emergency: '911 for all emergencies (Police, Fire, Medical)',
    budgetEstimate: '$150-300 per day (mid-range), excluding international flights'
  },
  {
    id: 'europe',
    name: 'Europe',
    image: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A continent of rich history, stunning architecture, diverse cultures, and world-class art. From the romantic streets of Paris to the ancient ruins of Rome, Europe captivates every traveler.',
    bestTimeToVisit: 'May to September (Summer), December for Christmas markets',
    currency: 'Euro (EUR) in most countries, British Pound (GBP) in UK',
    language: 'Multiple languages (English widely spoken in tourist areas)',
    timeZone: 'CET, EET, WET (Central, Eastern, Western European Time)',
    visaRequirements: 'Schengen visa for most countries. Check specific requirements by nationality.',
    topAttractions: [
      'Eiffel Tower, Paris',
      'Colosseum, Rome',
      'Sagrada Familia, Barcelona',
      'Swiss Alps',
      'Amsterdam Canals',
      'Greek Islands',
      'London\'s Historical Sites',
      'Prague Castle'
    ],
    travelTips: [
      'Use Eurail pass for train travel across countries',
      'Book museums and attractions online to skip queues',
      'Learn basic phrases in local languages',
      'Be aware of pickpockets in tourist areas',
      'Download offline maps for navigation',
      'Validate train tickets before boarding',
      'Try local markets for authentic food experiences'
    ],
    foodCulture: 'Each region offers unique culinary traditions. Must-try: French pastries, Italian pasta, Spanish tapas, German beer, Greek mezze.',
    transportation: 'Excellent rail network, budget airlines for longer distances, metro systems in major cities, bike-friendly infrastructure.',
    emergency: '112 (EU-wide emergency number)',
    budgetEstimate: '$100-250 per day (mid-range), varies significantly by country'
  },
  {
    id: 'india',
    name: 'India',
    image: 'https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A land of vibrant colors, ancient traditions, and incredible diversity. Experience the majestic Taj Mahal, spiritual Varanasi, backwaters of Kerala, and the bustling streets of Delhi.',
    bestTimeToVisit: 'October to March (Winter), April to June for hill stations',
    currency: 'Indian Rupee (INR)',
    language: 'Hindi, English, and 22 official regional languages',
    timeZone: 'IST (UTC+5:30)',
    visaRequirements: 'e-Visa available for many nationalities. Apply online before travel.',
    topAttractions: [
      'Taj Mahal, Agra',
      'Jaipur\'s Pink City Palaces',
      'Kerala Backwaters',
      'Varanasi Ghats',
      'Goa Beaches',
      'Golden Temple, Amritsar',
      'Himalayas & Kashmir',
      'Mumbai\'s Gateway of India'
    ],
    travelTips: [
      'Dress modestly, especially at religious sites',
      'Drink only bottled or filtered water',
      'Negotiate prices for rickshaws and taxis',
      'Use registered taxis or Uber/Ola apps',
      'Keep toilet paper and hand sanitizer handy',
      'Be cautious with street food initially',
      'Respect local customs and remove shoes at temples',
      'Book trains in advance, especially for long journeys'
    ],
    foodCulture: 'Rich and diverse cuisine with regional variations. Must-try: Butter chicken, biryani, dosa, street food, chai tea, regional thalis.',
    transportation: 'Extensive railway network, domestic flights for long distances, metro in major cities, rickshaws and taxis widely available.',
    emergency: '112 (Unified emergency number), 100 (Police), 108 (Ambulance)',
    budgetEstimate: '$30-80 per day (mid-range), very affordable for international travelers'
  },
  {
    id: 'china',
    name: 'China',
    image: 'https://images.pexels.com/photos/2412606/pexels-photo-2412606.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Ancient civilization meets modern marvels. Explore the Great Wall, Forbidden City, terracotta warriors, and experience the dynamism of Shanghai and Beijing.',
    bestTimeToVisit: 'April to May, September to October (Spring and Autumn)',
    currency: 'Chinese Yuan (CNY)',
    language: 'Mandarin Chinese (English limited outside major cities)',
    timeZone: 'CST (UTC+8)',
    visaRequirements: 'Visa required for most nationalities. Apply at Chinese embassy/consulate.',
    topAttractions: [
      'Great Wall of China',
      'Forbidden City, Beijing',
      'Terracotta Warriors, Xi\'an',
      'Shanghai Skyline & Bund',
      'Zhangjiajie National Park',
      'Li River, Guilin',
      'Potala Palace, Tibet',
      'Chengdu Panda Base'
    ],
    travelTips: [
      'Download VPN before arrival (many western sites blocked)',
      'Have address written in Chinese characters',
      'Download translation apps (work offline)',
      'Bring cash as foreign cards may not work everywhere',
      'Book trains through official apps or agencies',
      'Learn basic Mandarin phrases',
      'Use WeChat and Alipay for payments',
      'Be prepared for cultural differences'
    ],
    foodCulture: 'Regional cuisines with distinct flavors. Must-try: Peking duck, dim sum, hot pot, noodles, dumplings, regional specialties.',
    transportation: 'High-speed rail network, domestic flights, efficient metro systems, taxis and ride-sharing apps widely available.',
    emergency: '110 (Police), 120 (Ambulance), 119 (Fire)',
    budgetEstimate: '$60-150 per day (mid-range), higher in major cities'
  },
  {
    id: 'srilanka',
    name: 'Sri Lanka',
    image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'The Pearl of the Indian Ocean offers pristine beaches, ancient temples, tea plantations, wildlife safaris, and warm hospitality in a compact island nation.',
    bestTimeToVisit: 'December to March (West/South coast), April to September (East coast)',
    currency: 'Sri Lankan Rupee (LKR)',
    language: 'Sinhala, Tamil, English widely spoken',
    timeZone: 'SLST (UTC+5:30)',
    visaRequirements: 'Electronic Travel Authorization (ETA) required. Apply online.',
    topAttractions: [
      'Sigiriya Rock Fortress',
      'Temple of the Tooth, Kandy',
      'Yala National Park Safari',
      'Ella & Train Journey',
      'Galle Fort',
      'Tea Plantations, Nuwara Eliya',
      'Beautiful Beaches (Mirissa, Unawatuna)',
      'Anuradhapura Ancient City'
    ],
    travelTips: [
      'Cover shoulders and knees at religious sites',
      'Hire private driver for comfortable travel',
      'Book safari early morning or late afternoon',
      'Try the scenic train journey from Kandy to Ella',
      'Bargain at markets and with tuk-tuk drivers',
      'Be respectful of Buddha statues (no photos with back turned)',
      'Monsoon seasons vary by coast',
      'Use mosquito repellent in wildlife areas'
    ],
    foodCulture: 'Flavorful cuisine with coconut and spices. Must-try: Rice and curry, hoppers, kottu roti, fresh seafood, Ceylon tea.',
    transportation: 'Trains for scenic routes, buses widely available, tuk-tuks for short distances, private drivers recommended for touring.',
    emergency: '119 (Police), 110 (Ambulance)',
    budgetEstimate: '$40-100 per day (mid-range), excellent value for money'
  },
  {
    id: 'gulf',
    name: 'Gulf Countries (UAE, Qatar, Oman)',
    image: 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Modern luxury meets Arabian heritage. Experience world-class architecture, pristine deserts, luxury shopping, and traditional souks in this fascinating region.',
    bestTimeToVisit: 'November to March (pleasant weather, avoid summer heat)',
    currency: 'UAE Dirham (AED), Qatari Riyal (QAR), Omani Rial (OMR)',
    language: 'Arabic (English widely spoken)',
    timeZone: 'GST (UTC+4)',
    visaRequirements: 'On-arrival visa or e-visa for many nationalities. Check specific country requirements.',
    topAttractions: [
      'Burj Khalifa & Dubai Mall',
      'Sheikh Zayed Mosque, Abu Dhabi',
      'Desert Safari & Dune Bashing',
      'Palm Jumeirah',
      'Souq Waqif, Doha',
      'Muscat Grand Mosque',
      'Ferrari World, Abu Dhabi',
      'Louvre Abu Dhabi'
    ],
    travelTips: [
      'Dress modestly, especially in public areas',
      'Respect Islamic customs (no public affection)',
      'Alcohol consumption is restricted (available in hotels/licensed venues)',
      'Friday is the holy day (some places closed)',
      'Stay hydrated in hot climate',
      'Use metro and taxis for transportation',
      'Don\'t photograph people without permission',
      'Tipping is appreciated but not mandatory'
    ],
    foodCulture: 'Mix of Arabic, Persian, and international cuisine. Must-try: Shawarma, hummus, falafel, dates, Arabic coffee, mezze platters.',
    transportation: 'Modern metro systems, taxis and ride-sharing abundant, rental cars available, well-maintained roads.',
    emergency: '999 (Police), 998 (Ambulance) in UAE; 999 (all emergencies) in Qatar',
    budgetEstimate: '$100-300 per day (mid-range), can be expensive especially in UAE'
  }
];

export default function DestinationGuides() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-16">
        {/* Header with Back Button */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-light text-luxury-charcoal mb-4" style={{ letterSpacing: '-0.02em' }}>
              Destination Guides
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Comprehensive travel guides and tips for popular destinations around the world
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-luxury-teal text-white rounded-full hover:bg-luxury-teal/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="space-y-16">
          {destinationGuides.map((destination, index) => (
            <section
              key={destination.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Destination Header */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-8 h-8 text-luxury-teal" />
                    <h2 className="text-4xl font-light text-white" style={{ letterSpacing: '-0.02em' }}>
                      {destination.name}
                    </h2>
                  </div>
                  <p className="text-white/90 text-lg max-w-4xl">
                    {destination.description}
                  </p>
                </div>
              </div>

              {/* Essential Information */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-luxury-charcoal mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-luxury-orange" />
                  Essential Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Best Time to Visit</div>
                      <div className="text-gray-600 text-sm">{destination.bestTimeToVisit}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Currency</div>
                      <div className="text-gray-600 text-sm">{destination.currency}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Language</div>
                      <div className="text-gray-600 text-sm">{destination.language}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Time Zone</div>
                      <div className="text-gray-600 text-sm">{destination.timeZone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Visa Requirements</div>
                      <div className="text-gray-600 text-sm">{destination.visaRequirements}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-luxury-teal mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-luxury-charcoal mb-1">Budget Estimate</div>
                      <div className="text-gray-600 text-sm">{destination.budgetEstimate}</div>
                    </div>
                  </div>
                </div>

                {/* Top Attractions */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-luxury-charcoal mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-luxury-orange" />
                    Top Attractions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {destination.topAttractions.map((attraction, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                        <span className="text-luxury-teal font-bold text-sm mt-0.5">{idx + 1}.</span>
                        <span className="text-gray-700">{attraction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Travel Tips */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-luxury-charcoal mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-luxury-orange" />
                    Travel Tips
                  </h3>
                  <div className="space-y-2">
                    {destination.travelTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-luxury-teal/5 rounded-lg p-3">
                        <span className="text-luxury-orange">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-luxury-teal/10 to-luxury-teal/5 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils className="w-5 h-5 text-luxury-teal" />
                      <h4 className="font-semibold text-luxury-charcoal">Food Culture</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{destination.foodCulture}</p>
                  </div>

                  <div className="bg-gradient-to-br from-luxury-orange/10 to-luxury-orange/5 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="w-5 h-5 text-luxury-orange" />
                      <h4 className="font-semibold text-luxury-charcoal">Transportation</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{destination.transportation}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-luxury-charcoal">Emergency</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed font-medium">{destination.emergency}</p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-luxury-teal to-luxury-orange rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
            Ready to Explore These Destinations?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Let Fitinerary create your perfect personalized itinerary
          </p>
          <Link
            to="/generate"
            className="inline-block bg-white text-luxury-charcoal px-8 py-4 rounded-full font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Generate Your Itinerary
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
