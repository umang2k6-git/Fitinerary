import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (!profile.start_city || !profile.destination_city) {
      throw new Error("Starting point and destination are required");
    }

    const tripDuration = Math.ceil(
      (new Date(profile.trip_end_date).getTime() - new Date(profile.trip_start_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (tripDuration <= 0 || tripDuration > 30) {
      throw new Error("Invalid trip duration");
    }

    const budgetMultipliers = {
      budget: 0.7,
      balanced: 1.0,
      luxe: 1.5
    };

    const generatePackage = async (tier: string, multiplier: number) => {
      const adjustedBudgetMin = Math.floor(profile.budget_min * multiplier);
      const adjustedBudgetMax = Math.floor(profile.budget_max * multiplier);

      if (!OPENAI_API_KEY) {
        return generateMockPackage(tier, multiplier, profile, tripDuration, adjustedBudgetMin, adjustedBudgetMax);
      }

      const systemPrompt = `You are an expert travel planner for India. Generate a realistic, detailed ${tier} travel package itinerary based on actual places and experiences in ${profile.destination_city}.

User Profile:
- Starting Point: ${profile.start_city}
- Destination: ${profile.destination_city}
- Trip Duration: ${tripDuration} days (${profile.trip_start_date} to ${profile.trip_end_date})
- Traveling With: ${profile.travel_purpose}
- Budget Range: ₹${adjustedBudgetMin.toLocaleString()} - ₹${adjustedBudgetMax.toLocaleString()}
- Accommodation Style: ${profile.accommodation_style}
- Dining Preference: ${profile.dining_preference}
- Travel Pace: ${profile.travel_pace}
- Preferred Activities: ${profile.preferred_activities?.join(', ') || 'Not specified'}
- Special Interests (PRIORITIZE THESE): ${profile.special_interests?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${profile.dietary_restrictions || 'None'}
- Accessibility Requirements: ${profile.accessibility_requirements || 'None'}

CRITICAL REQUIREMENTS:
1. HEAVILY focus on user's Special Interests: ${profile.special_interests?.join(', ') || 'general experiences'}
2. Include actual places, restaurants, and attractions in ${profile.destination_city}
3. Make costs realistic for India
4. Total cost must fit within ₹${adjustedBudgetMin} - ₹${adjustedBudgetMax}
5. Plan exactly ${tripDuration} days of activities
6. Tailor to ${profile.travel_purpose} travelers

For ${tier} tier:
${tier === 'budget' ? '- Budget hotels (₹800-2000/night)\n- Local transport, street food\n- Free activities, temples, markets' : ''}
${tier === 'balanced' ? '- Mid-range hotels (₹3000-6000/night)\n- Mix of transport, local restaurants\n- Popular attractions' : ''}
${tier === 'luxe' ? '- Premium hotels (₹8000-20000/night)\n- Private transport, fine dining\n- Exclusive experiences' : ''}

Respond with JSON only:
{
  "packageName": "string",
  "tagline": "string",
  "tier": "${tier}",
  "totalCost": number,
  "costBreakdown": {"accommodation": number, "dining": number, "transportation": number, "activities": number, "miscellaneous": number},
  "highlights": ["string"],
  "accommodation": {"type": "string", "recommendations": ["string"]},
  "transportation": {"mode": "string", "details": "string"},
  "itinerary": [{"day": 1, "title": "string", "activities": [{"time": "string", "activity": "string", "description": "string", "cost": number}], "meals": {"breakfast": "string", "lunch": "string", "dinner": "string"}, "accommodation": "string"}]
}`;

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Generate the travel package itinerary." }
            ],
            temperature: 0.7,
            max_tokens: 2500,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          console.error("OpenAI API error, falling back to mock data");
          return generateMockPackage(tier, multiplier, profile, tripDuration, adjustedBudgetMin, adjustedBudgetMax);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
      } catch (error) {
        console.error("Error calling OpenAI, using mock data:", error);
        return generateMockPackage(tier, multiplier, profile, tripDuration, adjustedBudgetMin, adjustedBudgetMax);
      }
    };

    function generateMockPackage(tier: string, multiplier: number, profile: any, tripDuration: number, budgetMin: number, budgetMax: number) {
      const avgBudget = Math.floor((budgetMin + budgetMax) / 2);
      const perDayBudget = Math.floor(avgBudget / tripDuration);
      
      const accommodation = Math.floor(perDayBudget * 0.35);
      const dining = Math.floor(perDayBudget * 0.25);
      const transportation = Math.floor(perDayBudget * 0.15);
      const activities = Math.floor(perDayBudget * 0.20);
      const miscellaneous = perDayBudget - (accommodation + dining + transportation + activities);

      const tierDetails = {
        budget: {
          name: `Budget Explorer: ${profile.destination_city}`,
          tagline: "Experience more, spend less",
          accommodation: "Budget Hotels & Hostels",
          hotels: ["Zostel", "Backpacker Panda", "Moustache Hostel"],
          transport: "Local buses, shared taxis, and metro"
        },
        balanced: {
          name: `Balanced Journey: ${profile.destination_city}`,
          tagline: "Perfect blend of comfort and adventure",
          accommodation: "3-Star Hotels",
          hotels: ["Treebo Hotels", "Lemon Tree Hotels", "FabHotel"],
          transport: "Mix of private cabs and local transport"
        },
        luxe: {
          name: `Luxury Escape: ${profile.destination_city}`,
          tagline: "Indulge in premium experiences",
          accommodation: "5-Star Hotels & Resorts",
          hotels: ["Taj Hotels", "The Oberoi", "ITC Hotels"],
          transport: "Private chauffeur-driven cars"
        }
      };

      const details = tierDetails[tier as keyof typeof tierDetails];
      const interests = profile.special_interests || [];
      
      const highlights = [
        `Personalized ${interests[0] || 'sightseeing'} experiences`,
        `Best ${interests[1] || 'cultural'} spots in ${profile.destination_city}`,
        `${interests[2] || 'Local'} cuisine tasting tours`,
        `${tier === 'luxe' ? 'VIP' : tier === 'balanced' ? 'Curated' : 'Authentic'} local experiences`,
        `${profile.accommodation_style} accommodation options`,
        `Flexible ${profile.travel_pace} pace itinerary`
      ];

      const itinerary = [];
      for (let day = 1; day <= tripDuration; day++) {
        const dayActivities = [
          {
            time: "09:00 AM",
            activity: interests[0] ? `${interests[0]} Experience` : "Morning Sightseeing",
            description: `Explore the best ${interests[0] || 'attractions'} in ${profile.destination_city}`,
            cost: tier === 'luxe' ? 2000 : tier === 'balanced' ? 1000 : 500
          },
          {
            time: "12:30 PM",
            activity: "Local Cuisine Lunch",
            description: `Authentic ${profile.destination_city} delicacies at popular local spots`,
            cost: tier === 'luxe' ? 1500 : tier === 'balanced' ? 800 : 400
          },
          {
            time: "02:30 PM",
            activity: interests[1] ? `${interests[1]} Activity` : "Afternoon Adventure",
            description: `Immersive ${interests[1] || 'cultural'} experience`,
            cost: tier === 'luxe' ? 3000 : tier === 'balanced' ? 1500 : 700
          },
          {
            time: "06:00 PM",
            activity: interests[2] ? `Evening ${interests[2]}` : "Sunset Experience",
            description: `Enjoy ${interests[2] || 'scenic views'} as the sun sets`,
            cost: tier === 'luxe' ? 2500 : tier === 'balanced' ? 1200 : 500
          }
        ];

        itinerary.push({
          day,
          title: day === 1 ? "Arrival & Exploration" : day === tripDuration ? "Final Day & Departure" : `Discover ${profile.destination_city} - Day ${day}`,
          activities: dayActivities,
          meals: {
            breakfast: tier === 'luxe' ? "Hotel fine dining" : tier === 'balanced' ? "Hotel restaurant" : "Local cafe",
            lunch: `Popular ${profile.destination_city} restaurant`,
            dinner: tier === 'luxe' ? "Premium dining experience" : tier === 'balanced' ? "Mid-range restaurant" : "Street food tour"
          },
          accommodation: details.hotels[0]
        });
      }

      return {
        packageName: details.name,
        tagline: details.tagline,
        tier,
        totalCost: avgBudget,
        costBreakdown: {
          accommodation: accommodation * tripDuration,
          dining: dining * tripDuration,
          transportation: transportation * tripDuration,
          activities: activities * tripDuration,
          miscellaneous: miscellaneous * tripDuration
        },
        highlights,
        accommodation: {
          type: details.accommodation,
          recommendations: details.hotels
        },
        transportation: {
          mode: details.transport,
          details: `Comfortable ${tier} travel throughout your trip`
        },
        itinerary
      };
    }

    const packagePromises = Object.entries(budgetMultipliers).map(([tier, multiplier]) =>
      generatePackage(tier, multiplier)
    );

    const packages = await Promise.all(packagePromises);

    return new Response(
      JSON.stringify({ packages }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating packages:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate packages",
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});