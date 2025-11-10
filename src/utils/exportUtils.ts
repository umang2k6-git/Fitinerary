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
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
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

  const [timeStr, period] = timeString.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);

  let hour24 = hours;
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hour24 = 0;
    }
  }

  return new Date(currentYear, month, day, hour24, minutes || 0);
};

export const exportToICS = (itinerary: Itinerary): void => {
  const events: EventAttributes[] = [];

  itinerary.days_json.forEach((day: Day) => {
    day.activities.forEach((activity: Activity) => {
      const startDate = parseTimeToDate(day.date, activity.time);
      const durationMinutes = parseDurationToMinutes(activity.duration);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

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
    });
  });

  createEvents(events, (error, value) => {
    if (error) {
      console.error('Error creating ICS file:', error);
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itinerary.destination.replace(/\s+/g, '-')}-${itinerary.tier}-itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
};

const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const exportToPDF = async (itinerary: Itinerary): Promise<void> => {
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
      doc.text(activity.name, 25, yPosition + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`${activity.timeOfDay} • ${activity.time}`, 25, yPosition + 14);

      doc.setTextColor(0, 0, 0);
      doc.text(`${activity.venue}, ${activity.location}`, 25, yPosition + 20);

      const descLines = doc.splitTextToSize(activity.description, pageWidth - 130);
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
          console.error('Error adding image to PDF:', error);
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

  doc.save(`${itinerary.destination.replace(/\s+/g, '-')}-${itinerary.tier}-itinerary.pdf`);
};
