import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface GuestItinerary {
  id: string;
  destination: string;
  tier: string;
  total_cost: number;
  days_json: any;
  destination_hero_image_url?: string;
}

interface GuestItineraryContextType {
  sessionId: string;
  guestItineraries: GuestItinerary[];
  addGuestItinerary: (itinerary: Omit<GuestItinerary, 'id'>) => Promise<string>;
  getGuestItineraries: () => Promise<GuestItinerary[]>;
  clearGuestItineraries: () => void;
  migrateGuestItinerariesToUser: (userId: string) => Promise<void>;
}

const GuestItineraryContext = createContext<GuestItineraryContextType | undefined>(undefined);

const GUEST_SESSION_KEY = 'fitinerary_guest_session';
const GUEST_ITINERARIES_KEY = 'fitinerary_guest_itineraries';

function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }

  return sessionId;
}

export function GuestItineraryProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [guestItineraries, setGuestItineraries] = useState<GuestItinerary[]>([]);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    loadGuestItineraries();
  }, []);

  const loadGuestItineraries = () => {
    try {
      const stored = localStorage.getItem(GUEST_ITINERARIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setGuestItineraries(parsed);
      }
    } catch (error) {
      console.error('Error loading guest itineraries:', error);
    }
  };

  const saveToLocalStorage = (itineraries: GuestItinerary[]) => {
    try {
      localStorage.setItem(GUEST_ITINERARIES_KEY, JSON.stringify(itineraries));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const addGuestItinerary = async (itinerary: Omit<GuestItinerary, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('guest_itineraries')
        .insert({
          session_id: sessionId,
          destination: itinerary.destination,
          destination_hero_image_url: itinerary.destination_hero_image_url || null,
          trip_brief: '',
          tier: itinerary.tier,
          days_json: itinerary.days_json,
          total_cost: itinerary.total_cost,
          duration_days: 2,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving guest itinerary to database:', error);
        const tempId = `temp_${Date.now()}`;
        const newItinerary = { ...itinerary, id: tempId };
        const updated = [...guestItineraries, newItinerary];
        setGuestItineraries(updated);
        saveToLocalStorage(updated);
        return tempId;
      }

      const newItinerary = { ...itinerary, id: data.id };
      const updated = [...guestItineraries, newItinerary];
      setGuestItineraries(updated);
      saveToLocalStorage(updated);

      return data.id;
    } catch (error) {
      console.error('Error in addGuestItinerary:', error);
      const tempId = `temp_${Date.now()}`;
      const newItinerary = { ...itinerary, id: tempId };
      const updated = [...guestItineraries, newItinerary];
      setGuestItineraries(updated);
      saveToLocalStorage(updated);
      return tempId;
    }
  };

  const getGuestItineraries = async (): Promise<GuestItinerary[]> => {
    return guestItineraries;
  };

  const clearGuestItineraries = () => {
    setGuestItineraries([]);
    localStorage.removeItem(GUEST_ITINERARIES_KEY);
  };

  const migrateGuestItinerariesToUser = async (userId: string) => {
    if (guestItineraries.length === 0) return;

    try {
      const itinerariesToMigrate = guestItineraries.map(itinerary => ({
        user_id: userId,
        destination: itinerary.destination,
        destination_hero_image_url: itinerary.destination_hero_image_url || null,
        trip_brief: '',
        tier: itinerary.tier,
        days_json: itinerary.days_json,
        total_cost: itinerary.total_cost,
        duration_days: 2,
      }));

      const { error } = await supabase
        .from('itineraries')
        .insert(itinerariesToMigrate);

      if (error) {
        console.error('Error migrating itineraries:', error);
        throw error;
      }

      clearGuestItineraries();
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  };

  const value = {
    sessionId,
    guestItineraries,
    addGuestItinerary,
    getGuestItineraries,
    clearGuestItineraries,
    migrateGuestItinerariesToUser,
  };

  return (
    <GuestItineraryContext.Provider value={value}>
      {children}
    </GuestItineraryContext.Provider>
  );
}

export function useGuestItinerary() {
  const context = useContext(GuestItineraryContext);
  if (context === undefined) {
    throw new Error('useGuestItinerary must be used within a GuestItineraryProvider');
  }
  return context;
}
