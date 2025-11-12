import { createEvents, DateArray, EventAttributes } from 'ics';
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

const parseTimeToDate = (dayDate: string, timeString: string): Date => {
  const currentYear = new Date().getFullYear();
  const monthMap: Record<string, number> = {
    'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
    'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
    'july': 6, 'jul': 6, 'august': 7, 'aug': 7, 'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9, 'november': 10, 'nov': 10, 'december': 11, 'dec': 11
  };

  const dateRegex = /(\w+)\s+(\d+)/i;
  const match = dayDate.match(dateRegex);

  let month = new Date().getMonth();
  let day = new Date().getDate();

  if (match) {
    const monthName = match[1].toLowerCase();
    if (monthMap[monthName] !== undefined) {
      month = monthMap[monthName];
    }
    day = parseInt(match[2]);
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

export const exportToICS = (itinerary: Itinerary): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const events: EventAttributes[] = [];

      console.log('Starting ICS export with', itinerary.days_json.length, 'days');

      itinerary.days_json.forEach((day: Day) => {
        day.activities.forEach((activity: Activity) => {
          try {
            const startDate = parseTimeToDate(day.date, activity.time);
            const durationMinutes = parseDurationToMinutes(activity.duration);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.warn(`Invalid date for activity: ${activity.name}`);
              return;
            }

            const start: DateArray = [
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              startDate.getDate(),
              startDate.getHours(),
              startDate.getMinutes()
            ];

            const end: DateArray = [
              endDate.getFullYear(),
              endDate.getMonth() + 1,
              endDate.getDate(),
              endDate.getHours(),
              endDate.getMinutes()
            ];

            events.push({
              start,
              end,
              title: activity.name,
              description: `${activity.description}\n\nCost: ₹${activity.cost}\nDuration: ${activity.duration}`,
              location: `${activity.venue}, ${activity.location}`,
              status: 'CONFIRMED',
              busyStatus: 'BUSY',
              organizer: { name: 'Fitinerary', email: 'noreply@fitinerary.com' }
            });
          } catch (activityError) {
            console.warn(`Error processing activity ${activity.name}:`, activityError);
          }
        });
      });

      if (events.length === 0) {
        reject(new Error('No valid events to export'));
        return;
      }

      console.log(`Creating ICS file with ${events.length} events`);

      createEvents(events, (error, value) => {
        if (error) {
          console.error('Error creating ICS file:', error);
          reject(new Error(`Failed to create calendar file: ${error.message || error}`));
          return;
        }

        if (!value) {
          reject(new Error('No ICS content generated'));
          return;
        }

        try {
          const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${itinerary.destination.replace(/\s+/g, '-')}-${itinerary.tier}-itinerary.ics`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log('ICS file downloaded successfully');
            resolve();
          }, 100);
        } catch (downloadError) {
          console.error('Error downloading ICS file:', downloadError);
          reject(new Error('Failed to download calendar file'));
        }
      });
    } catch (error: any) {
      console.error('Error in exportToICS:', error);
      reject(new Error(`Failed to export to calendar: ${error.message || error}`));
    }
  });
};

const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status}`);
      return null;
    }

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.warn('FileReader error');
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error loading image:', error);
    return null;
  }
};

export const exportToPDF = async (itinerary: Itinerary): Promise<void> => {
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
    doc.text(itinerary.destination, pageWidth / 2, 20, { align: 'center' });

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
    doc.text(`Total Cost: ₹${itinerary.total_cost.toLocaleString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Duration: ${itinerary.duration_days} days`, 20, yPosition);
    yPosition += 15;

    for (const day of itinerary.days_json) {
      addPageIfNeeded(30);

      doc.setFillColor(20, 184, 166);
      doc.roundedRect(20, yPosition - 5, 50, 10, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${day.day}`, 45, yPosition + 2, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.text(day.date, 80, yPosition + 2);
      yPosition += 15;

      for (const activity of day.activities) {
        addPageIfNeeded(60);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, 'S');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const activityTitle = doc.splitTextToSize(activity.name, pageWidth - 85);
        doc.text(activityTitle, 25, yPosition + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${activity.timeOfDay} • ${activity.time}`, 25, yPosition + 14);

        doc.setTextColor(0, 0, 0);
        const venueText = doc.splitTextToSize(`${activity.venue}, ${activity.location}`, pageWidth - 85);
        doc.text(venueText, 25, yPosition + 20);

        const descLines = doc.splitTextToSize(activity.description, pageWidth - 85);
        doc.text(descLines, 25, yPosition + 26);

        doc.setTextColor(20, 184, 166);
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${activity.cost}`, pageWidth - 35, yPosition + 8, { align: 'right' });

        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(activity.duration, pageWidth - 35, yPosition + 14, { align: 'right' });

        if (activity.images && activity.images.length > 0) {
          try {
            const imageData = await loadImageAsBase64(activity.images[0]);
            if (imageData) {
              doc.addImage(imageData, 'JPEG', pageWidth - 55, yPosition + 5, 20, 20);
            }
          } catch (error) {
            console.warn('Skipping image due to error:', error);
          }
        }

        yPosition += 55;
      }

      yPosition += 5;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerText = 'Created with Fitinerary';
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    const fileName = `${itinerary.destination.replace(/\s+/g, '-')}-${itinerary.tier}-itinerary.pdf`;
    doc.save(fileName);

    console.log('PDF exported successfully');
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};
