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

    const tripDuration = Math.ceil(
      (new Date(profile.trip_end_date).getTime() - new Date(profile.trip_start_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const budgetMultipliers = {
      budget: 0.7,
      balanced: 1.0,
      luxe: 1.5
    };

    const packages = [];

    for (const [tier, multiplier] of Object.entries(budgetMultipliers)) {
      const adjustedBudgetMin = Math.floor(profile.budget_min * multiplier);
      const adjustedBudgetMax = Math.floor(profile.budget_max * multiplier);

      const systemPrompt = `You are an expert travel planner. Generate a detailed ${tier} travel package itinerary.

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

Generate a ${tier.toUpperCase()} package with:
1. Package name and tagline
2. Day-by-day detailed itinerary
3. Accommodation recommendations
4. Dining suggestions
5. Transportation details
6. Estimated cost breakdown
7. Highlights and unique experiences

For ${tier} tier:
${tier === 'budget' ? '- Focus on cost-effective options, hostels/budget hotels, local transport, street food\n- Include free activities and budget-friendly experiences' : ''}
${tier === 'balanced' ? '- Mix of comfort and value, mid-range hotels, mix of transport options\n- Balance between popular attractions and local experiences' : ''}
${tier === 'luxe' ? '- Premium accommodations, private transport, fine dining\n- Exclusive experiences, VIP access, personalized services' : ''}

Format the response as JSON with this structure:
{
  "packageName": "string",
  "tagline": "string",
  "tier": "${tier}",
  "totalCost": number,
  "costBreakdown": {
    "accommodation": number,
    "dining": number,
    "transportation": number,
    "activities": number,
    "miscellaneous": number
  },
  "highlights": ["string"],
  "accommodation": {
    "type": "string",
    "recommendations": ["string"]
  },
  "transportation": {
    "mode": "string",
    "details": "string"
  },
  "itinerary": [
    {
      "day": number,
      "title": "string",
      "activities": [
        {
          "time": "string",
          "activity": "string",
          "description": "string",
          "cost": number
        }
      ],
      "meals": {
        "breakfast": "string",
        "lunch": "string",
        "dinner": "string"
      },
      "accommodation": "string"
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
            { role: "user", content: "Generate the travel package itinerary." }
          ],
          temperature: 0.8,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const packageData = JSON.parse(data.choices[0].message.content);
      packages.push(packageData);
    }

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
      JSON.stringify({ error: error.message }),
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