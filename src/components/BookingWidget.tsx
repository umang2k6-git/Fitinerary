import { useState } from 'react';
import { Plane, Hotel, Car, Ship, Search, Calendar, Users } from 'lucide-react';

type TabType = 'flights' | 'hotels' | 'cars' | 'cruises';

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState<TabType>('flights');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    adults: '1',
    children: '0',
  });

  const tabs: { id: TabType; label: string; icon: typeof Plane }[] = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'cruises', label: 'Cruises', icon: Ship },
  ];

  const handleSearch = () => {
    console.log('Search:', { tab: activeTab, ...formData });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-luxury p-6 md:p-8">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-luxury-teal text-white shadow-glow-teal'
                  : 'text-gray-600 hover:text-luxury-teal hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flying from
          </label>
          <input
            type="text"
            placeholder="City or Airport"
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            placeholder="City or Airport"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departing
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="MM/DD/YY"
              value={formData.departure}
              onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Returning
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="MM/DD/YY"
              value={formData.return}
              onChange={(e) => setFormData({ ...formData, return: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adult
          </label>
          <div className="relative">
            <select
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all appearance-none"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child
          </label>
          <div className="relative">
            <select
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all appearance-none"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            onClick={handleSearch}
            className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-semibold
                     transition-all duration-300 hover:shadow-glow-teal hover:scale-105 active:scale-98
                     flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
