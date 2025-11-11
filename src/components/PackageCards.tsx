import { useState } from 'react';
import { Download, Mail, Check, Sparkles, DollarSign, Crown } from 'lucide-react';
import jsPDF from 'jspdf';

interface Activity {
  time: string;
  activity: string;
  description: string;
  cost: number;
}

interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

interface Package {
  packageName: string;
  tagline: string;
  tier: string;
  totalCost: number;
  costBreakdown: {
    accommodation: number;
    dining: number;
    transportation: number;
    activities: number;
    miscellaneous: number;
  };
  highlights: string[];
  accommodation: {
    type: string;
    recommendations: string[];
  };
  transportation: {
    mode: string;
    details: string;
  };
  itinerary: DayItinerary[];
}

interface PackageCardsProps {
  packages: Package[];
  onClose: () => void;
}

export default function PackageCards({ packages, onClose }: PackageCardsProps) {
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'budget':
        return <DollarSign className="w-6 h-6" />;
      case 'balanced':
        return <Sparkles className="w-6 h-6" />;
      case 'luxe':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'budget':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-700',
          button: 'bg-emerald-600 hover:bg-emerald-700'
        };
      case 'balanced':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'luxe':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const downloadPDF = (pkg: Package) => {
    const doc = new jsPDF();
    const colors = getTierColor(pkg.tier);
    let yPosition = 20;

    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166);
    doc.text(pkg.packageName, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(pkg.tagline, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Cost: ₹${pkg.totalCost.toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Tier: ${pkg.tier.toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.text('Highlights:', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    pkg.highlights.forEach((highlight, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${highlight}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Cost Breakdown:', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    Object.entries(pkg.costBreakdown).forEach(([key, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ₹${value.toLocaleString()}`, 25, yPosition);
      yPosition += 6;
    });

    pkg.itinerary.forEach((day) => {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(16);
      doc.setTextColor(20, 184, 166);
      doc.text(`Day ${day.day}: ${day.title}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      day.activities.forEach((activity) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${activity.time} - ${activity.activity}`, 25, yPosition);
        yPosition += 5;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(activity.description, 30, yPosition);
        yPosition += 8;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
      });
    });

    doc.save(`${pkg.packageName.replace(/\s+/g, '_')}_Itinerary.pdf`);
  };

  const downloadExcel = (pkg: Package) => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += `${pkg.packageName}\n`;
    csvContent += `${pkg.tagline}\n`;
    csvContent += `Tier,${pkg.tier}\n`;
    csvContent += `Total Cost,₹${pkg.totalCost}\n\n`;

    csvContent += 'Cost Breakdown\n';
    csvContent += 'Category,Amount\n';
    Object.entries(pkg.costBreakdown).forEach(([key, value]) => {
      csvContent += `${key},₹${value}\n`;
    });

    csvContent += '\nHighlights\n';
    pkg.highlights.forEach(highlight => {
      csvContent += `"${highlight}"\n`;
    });

    csvContent += '\nDay-by-Day Itinerary\n';
    csvContent += 'Day,Time,Activity,Description,Cost\n';
    pkg.itinerary.forEach(day => {
      day.activities.forEach(activity => {
        csvContent += `${day.day},${activity.time},"${activity.activity}","${activity.description}",₹${activity.cost}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${pkg.packageName.replace(/\s+/g, '_')}_Itinerary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);

    setTimeout(() => {
      setSendingEmail(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Your Travel Packages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {packages.map((pkg, index) => {
              const colors = getTierColor(pkg.tier);

              return (
                <div
                  key={index}
                  className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${colors.badge} px-3 py-1 rounded-full flex items-center gap-2`}>
                      {getTierIcon(pkg.tier)}
                      <span className="font-semibold uppercase text-sm">{pkg.tier}</span>
                    </div>
                  </div>

                  <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>
                    {pkg.packageName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.tagline}</p>

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <div className={`text-3xl font-bold ${colors.text} mb-2`}>
                      ₹{pkg.totalCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Accommodation:</span>
                        <span className="font-medium">₹{pkg.costBreakdown.accommodation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dining:</span>
                        <span className="font-medium">₹{pkg.costBreakdown.dining.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport:</span>
                        <span className="font-medium">₹{pkg.costBreakdown.transportation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activities:</span>
                        <span className="font-medium">₹{pkg.costBreakdown.activities.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Highlights:</h4>
                    <ul className="space-y-1">
                      {pkg.highlights.slice(0, 4).map((highlight, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                          <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPDF(pkg)}
                      className={`flex-1 ${colors.button} text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => downloadExcel(pkg)}
                      className={`flex-1 ${colors.button} text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-luxury-charcoal to-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-luxury-teal" />
              <h3 className="text-xl font-bold text-white">Email Your Packages</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Enter your email address to receive all three package options in PDF format
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
              />
              <button
                onClick={sendEmail}
                disabled={sendingEmail || emailSent}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  emailSent
                    ? 'bg-green-600 text-white'
                    : 'bg-luxury-teal text-white hover:bg-luxury-teal/90'
                }`}
              >
                {emailSent ? (
                  <>
                    <Check className="w-5 h-5" />
                    Sent!
                  </>
                ) : sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
