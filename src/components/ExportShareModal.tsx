import { useEffect, useState } from 'react';
import { Calendar, FileText, X, Download, Loader2 } from 'lucide-react';
import { exportToICS, exportToPDF } from '../utils/exportUtils';

interface Activity {
  timeOfDay: string;
  time: string;
  name: string;
  venue: string;
  location: string;
  description: string;
  duration: string;
  cost: number;
  images?: string[];
}

interface Day {
  day: number;
  date: string;
  activities: Activity[];
}

interface Itinerary {
  id: string;
  destination: string;
  destination_hero_image_url: string;
  tier: string;
  days_json: Day[];
  total_cost: number;
  duration_days: number;
}

interface ExportShareModalProps {
  itinerary: Itinerary;
  onClose: () => void;
}

export default function ExportShareModal({ itinerary, onClose }: ExportShareModalProps) {
  const [loadingICS, setLoadingICS] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleICSExport = async () => {
    setLoadingICS(true);
    setError(null);
    try {
      await exportToICS(itinerary);
    } catch (err: any) {
      setError(err.message || 'Failed to export calendar file');
      console.error('ICS export error:', err);
    } finally {
      setLoadingICS(false);
    }
  };

  const handlePDFExport = async () => {
    setLoadingPDF(true);
    setError(null);
    try {
      await exportToPDF(itinerary);
    } catch (err: any) {
      setError(err.message || 'Failed to export PDF');
      console.error('PDF export error:', err);
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-float max-w-2xl w-full p-8 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Export & Share
          </h2>
          <p className="text-gray-600">
            Download your itinerary in your preferred format
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleICSExport}
            disabled={loadingICS || loadingPDF}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-luxury-teal hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-teal/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-300" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 mb-4">
                {loadingICS ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <Calendar className="w-7 h-7 text-white" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Calendar File
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                Download as ICS file to import into Google Calendar, Apple Calendar, or Outlook
              </p>

              <div className="flex items-center text-luxury-teal font-medium text-sm">
                <span>{loadingICS ? 'Preparing...' : 'Download ICS'}</span>
                {!loadingICS && (
                  <Download className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
                )}
              </div>
            </div>
          </button>

          <button
            onClick={handlePDFExport}
            disabled={loadingICS || loadingPDF}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-luxury-orange hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-orange/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-300" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 mb-4">
                {loadingPDF ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <FileText className="w-7 h-7 text-white" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PDF Document
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                Download as beautifully formatted PDF with all details and activity images
              </p>

              <div className="flex items-center text-luxury-orange font-medium text-sm">
                <span>{loadingPDF ? 'Generating...' : 'Download PDF'}</span>
                {!loadingPDF && (
                  <Download className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium text-gray-900">Pro tip:</span> The ICS file creates individual calendar events for each activity with reminders and location details.
          </p>
        </div>
      </div>
    </div>
  );
}
