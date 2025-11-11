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

    const budgetMultipliers = {
      budget: 0.7,
      balanced: 1.0,
      luxe: 1.5
    };

    const generatePackage = async (tier: string, multiplier: number) => {
      const adjustedBudgetMin = Math.floor(profile.budget_min * multiplier);
      const adjustedBudgetMax = Math.floor(profile.budget_max * multiplier);

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
- Special Interests: ${profile.special_interests?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${profile.dietary_restrictions || 'None'}
- Accessibility Requirements: ${profile.accessibility_requirements || 'None'}

IMPORTANT REQUIREMENTS:
1. Focus heavily on the user's Special Interests (${profile.special_interests?.join(', ') || 'general experiences'})
2. Include actual places, restaurants, and attractions in ${profile.destination_city}
3. Make costs realistic for India (use actual price ranges)
4. Ensure total cost fits within the budget range
5. Plan ${tripDuration} days of activities
6. Tailor activities to ${profile.travel_purpose} travelers

For ${tier} tier:
${tier === 'budget' ? '- Hostels/budget hotels (₹800-2000/night)\n- Local transport, street food\n- Free/low-cost activities (parks, temples, markets)\n- Total: ~₹5000-8000/day' : ''}
${tier === 'balanced' ? '- Mid-range hotels (₹3000-6000/night)\n- Mix of transport, local restaurants\n- Popular attractions, some unique experiences\n- Total: ~₹8000-15000/day' : ''}
${tier === 'luxe' ? '- Premium hotels/resorts (₹8000-20000/night)\n- Private transport, fine dining\n- Exclusive experiences, spa, VIP access\n- Total: ~₹15000-30000/day' : ''}

Format as JSON:
{
  "packageName": "Catchy name for ${profile.destination_city} trip",
  "tagline": "One-line tagline",
  "tier": "${tier}",
  "totalCost": ${adjustedBudgetMin + Math.floor((adjustedBudgetMax - adjustedBudgetMin) * 0.6)},
  "costBreakdown": {
    "accommodation": number,
    "dining": number,
    "transportation": number,
    "activities": number,
    "miscellaneous": number
  },
  "highlights": ["5-6 key highlights matching user interests"],
  "accommodation": {
    "type": "Hotel type",
    "recommendations": ["2-3 actual hotel names in ${profile.destination_city}"]
  },
  "transportation": {
    "mode": "Transport type",
    "details": "Brief details"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "description": "1-line description",
          "cost": 500
        }
      ],
      "meals": {
        "breakfast": "Restaurant/Hotel name",
        "lunch": "Restaurant name",
        "dinner": "Restaurant name"
      },
      "accommodation": "Hotel name"
    }
  ]
}`;

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
            { role: "user", content: "Generate the travel package itinerary with realistic Indian places and costs." }
          ],
          temperature: 0.7,
          max_tokens: 2500,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const packageData = JSON.parse(data.choices[0].message.content);
      return packageData;
    };

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
      JSON.stringify({ error: error.message || "Failed to generate packages" }),
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