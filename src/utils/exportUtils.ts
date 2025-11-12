import jsPDF from 'jspdf';

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

const parseDurationToMinutes = (duration: string): number => {
  const hourMatch = duration.match(/(\d+)\s*hour/i);
  const minuteMatch = duration.match(/(\d+)\s*min/i);

  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minuteMatch) minutes += parseInt(minuteMatch[1]);

  return minutes || 60;
};

const parseTimeToDate = (dayDate: string, dayNumber: number, timeString: string): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Calculate the date based on day number (1 = today, 2 = tomorrow, etc.)
  const targetDate = new Date(currentYear, currentMonth, currentDay + (dayNumber - 1));

  // If dayDate contains a month and day (e.g., "January 15"), use that instead
  const monthMap: Record<string, number> = {
    'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
    'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
    'july': 6, 'jul': 6, 'august': 7, 'aug': 7, 'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9, 'november': 10, 'nov': 10, 'december': 11, 'dec': 11
  };

  const dateRegex = /(\w+)\s+(\d+)/i;
  const match = dayDate.match(dateRegex);

  let month = targetDate.getMonth();
  let day = targetDate.getDate();

  if (match) {
    const monthName = match[1].toLowerCase();
    if (monthMap[monthName] !== undefined) {
      month = monthMap[monthName];
      day = parseInt(match[2]);
    }
  }

  if (!timeString) {
    return new Date(currentYear, month, day, 9, 0);
  }

  const timeStringClean = timeString.trim();
  const parts = timeStringClean.split(' ');
  const timePart = parts[0];
  const period = parts[1] || '';

  const timeParts = timePart.split(':');
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;

  let hour24 = hours;
  if (period) {
    const periodUpper = period.toUpperCase();
    if (periodUpper === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (periodUpper === 'AM' && hours === 12) {
      hour24 = 0;
    }
  }

  const date = new Date(currentYear, month, day, hour24, minutes);

  if (isNaN(date.getTime())) {
    console.warn(`Invalid date parsed: ${dayDate} ${timeString}`);
    return new Date(currentYear, month, day, 9, 0);
  }

  return date;
};

const formatICSDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

const generateUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@fitinerary.com`;
};

export const exportToICS = async (itinerary: Itinerary): Promise<void> => {
  console.log('=== Starting Manual ICS Export ===');
  console.log('Destination:', itinerary.destination);
  console.log('Days:', itinerary.days_json?.length);

  try {
    if (!itinerary.days_json || itinerary.days_json.length === 0) {
      throw new Error('No itinerary data available to export');
    }

    const icsLines: string[] = [];

    icsLines.push('BEGIN:VCALENDAR');
    icsLines.push('VERSION:2.0');
    icsLines.push('PRODID:-//Fitinerary//Travel Itinerary//EN');
    icsLines.push('CALSCALE:GREGORIAN');
    icsLines.push('METHOD:PUBLISH');
    icsLines.push(`X-WR-CALNAME:${escapeICSText(itinerary.destination)} - ${itinerary.tier} Tier`);
    icsLines.push('X-WR-TIMEZONE:UTC');

    let eventCount = 0;

    for (const day of itinerary.days_json) {
      if (!day.activities || day.activities.length === 0) {
        console.warn(`Day ${day.day} has no activities`);
        continue;
      }

      for (const activity of day.activities) {
        try {
          if (!activity.name || !activity.time) {
            console.warn('Skipping activity with missing required fields:', activity);
            continue;
          }

          const startDate = parseTimeToDate(day.date || 'Day ' + day.day, day.day, activity.time);
          const durationMinutes = parseDurationToMinutes(activity.duration || '1 hour');
          const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn(`Invalid date for activity: ${activity.name}`);
            continue;
          }

          const uid = generateUID();
          const dtstamp = formatICSDate(new Date());
          const dtstart = formatICSDate(startDate);
          const dtend = formatICSDate(endDate);

          const description = activity.description
            ? `${activity.description}\\n\\nCost: ₹${activity.cost || 0}\\nDuration: ${activity.duration || 'N/A'}`
            : `Cost: ₹${activity.cost || 0}\\nDuration: ${activity.duration || 'N/A'}`;

          const location = activity.venue && activity.location
            ? `${activity.venue}, ${activity.location}`
            : (activity.venue || activity.location || 'Location TBD');

          icsLines.push('BEGIN:VEVENT');
          icsLines.push(`UID:${uid}`);
          icsLines.push(`DTSTAMP:${dtstamp}`);
          icsLines.push(`DTSTART:${dtstart}`);
          icsLines.push(`DTEND:${dtend}`);
          icsLines.push(`SUMMARY:${escapeICSText(activity.name)}`);
          icsLines.push(`DESCRIPTION:${escapeICSText(description)}`);
          icsLines.push(`LOCATION:${escapeICSText(location)}`);
          icsLines.push('STATUS:CONFIRMED');
          icsLines.push('TRANSP:OPAQUE');
          icsLines.push('END:VEVENT');

          eventCount++;
          console.log(`Added event ${eventCount}: ${activity.name} on ${day.date} at ${activity.time}`);
        } catch (activityError: any) {
          console.error(`Error processing activity "${activity.name}":`, activityError);
        }
      }
    }

    icsLines.push('END:VCALENDAR');

    if (eventCount === 0) {
      throw new Error('No valid events could be created from the itinerary');
    }

    const icsContent = icsLines.join('\r\n');
    console.log(`Total events created: ${eventCount}`);
    console.log('ICS content length:', icsContent.length);

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8'
    });

    console.log('Blob created, size:', blob.size);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const sanitizedDestination = itinerary.destination.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-');
    const fileName = `${sanitizedDestination}-${itinerary.tier}-itinerary.ics`;

    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);

    console.log('Triggering download for:', fileName);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('=== ICS Export Completed Successfully ===');
    }, 200);
  } catch (error: any) {
    console.error('=== ICS Export Failed ===');
    console.error('Error:', error);
    throw new Error(`Failed to export calendar: ${error.message || error}`);
  }
};

export const exportToPDF = async (itinerary: Itinerary): Promise<void> => {
  console.log('Starting PDF export for:', itinerary.destination);

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    const addPageIfNeeded = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);

    const destinationText = doc.splitTextToSize(itinerary.destination, pageWidth - 40);
    doc.text(destinationText, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${itinerary.tier} Tier • ${itinerary.duration_days} Day Itinerary`, pageWidth / 2, 30, { align: 'center' });

    yPosition = 50;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const totalCost = itinerary.total_cost ? itinerary.total_cost.toLocaleString() : '0';
    doc.text(`Total Cost: ₹${totalCost}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Duration: ${itinerary.duration_days} days`, 20, yPosition);
    yPosition += 15;

    console.log(`Processing ${itinerary.days_json.length} days`);

    for (const day of itinerary.days_json) {
      addPageIfNeeded(30);

      doc.setFillColor(20, 184, 166);
      doc.roundedRect(20, yPosition - 5, 50, 10, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${day.day}`, 45, yPosition + 2, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.text(day.date || '', 80, yPosition + 2);
      yPosition += 15;

      for (const activity of day.activities) {
        try {
          addPageIfNeeded(60);

          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, 'S');

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const activityTitle = doc.splitTextToSize(activity.name || 'Activity', pageWidth - 85);
          doc.text(activityTitle, 25, yPosition + 8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`${activity.timeOfDay || ''} • ${activity.time || ''}`, 25, yPosition + 14);

          doc.setTextColor(0, 0, 0);
          const venue = activity.venue || 'Venue TBD';
          const location = activity.location || '';
          const venueText = doc.splitTextToSize(`${venue}, ${location}`, pageWidth - 85);
          doc.text(venueText, 25, yPosition + 20);

          const description = activity.description || 'No description available';
          const descLines = doc.splitTextToSize(description, pageWidth - 85);
          doc.text(descLines, 25, yPosition + 26);

          doc.setTextColor(20, 184, 166);
          doc.setFont('helvetica', 'bold');
          const cost = activity.cost || 0;
          doc.text(`₹${cost}`, pageWidth - 35, yPosition + 8, { align: 'right' });

          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(activity.duration || '', pageWidth - 35, yPosition + 14, { align: 'right' });

          yPosition += 55;
        } catch (activityError) {
          console.warn('Error processing activity:', activityError);
        }
      }

      yPosition += 5;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerText = 'Created with Fitinerary';
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    const sanitizedDestination = itinerary.destination.replace(/[^a-zA-Z0-9-_]/g, '-');
    const fileName = `${sanitizedDestination}-${itinerary.tier}-itinerary.pdf`;

    console.log('Saving PDF as:', fileName);
    doc.save(fileName);

    console.log('PDF exported successfully');
  } catch (error: any) {
    console.error('Error in exportToPDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to export PDF: ${error.message || 'Unknown error'}`);
  }
};
