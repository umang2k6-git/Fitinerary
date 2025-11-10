import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const prompt = `You are a travel expert. Based on the following user preferences, suggest 6 diverse weekend getaway destinations in India that perfectly match their criteria. Consider both popular and hidden gems.

User Preferences:
- Start City: ${profile.start_city}
- Travel Dates: ${profile.trip_start_date} to ${profile.trip_end_date} (${tripDuration} days)
- Traveling With: ${profile.travel_purpose}
- Budget Range: ₹${profile.budget_min.toLocaleString('en-IN')} - ₹${profile.budget_max.toLocaleString('en-IN')}
- Accommodation Style: ${profile.accommodation_style}
- Dining Preference: ${profile.dining_preference}
- Travel Pace: ${profile.travel_pace}
- Preferred Activities: ${profile.preferred_activities.join(', ')}
- Special Interests: ${profile.special_interests.join(', ')}
${profile.dietary_restrictions ? `- Dietary Restrictions: ${profile.dietary_restrictions}` : ''}
${profile.accessibility_requirements ? `- Accessibility Needs: ${profile.accessibility_requirements}` : ''}

For each destination, provide:
1. Name (city/place name)
2. State in India
3. Brief description (2-3 sentences highlighting why it matches their preferences)
4. Estimated budget for the trip
5. Best suited for (activity types that match their interests)
6. Distance from their start city (approximate)

Return ONLY a valid JSON array with 6 destinations in this exact format:
[
  {
    "name": "Destination Name",
    "state": "State Name",
    "description": "Brief description",
    "estimatedBudget": 50000,
    "bestFor": ["Activity 1", "Activity 2", "Activity 3"],
    "distanceFromStart": "XXX km",
    "matchScore": 95
  }
]

Ensure destinations are diverse, realistic, and truly match the user's preferences and budget. Match score should be 0-100 based on how well it fits.`;

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a travel expert specializing in Indian destinations. Always respond with valid JSON only, no markdown or explanations." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const openAIData = await openAIResponse.json();
    let destinations;

    try {
      const content = openAIData.choices[0].message.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        destinations = JSON.parse(jsonMatch[0]);
      } else {
        destinations = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", openAIData.choices[0].message.content);
      throw new Error("Failed to parse destination suggestions");
    }

    return new Response(
      JSON.stringify({
        destinations,
        profile: {
          start_city: profile.start_city,
          trip_start_date: profile.trip_start_date,
          trip_end_date: profile.trip_end_date,
          travel_purpose: profile.travel_purpose,
          budget_max: profile.budget_max,
        }
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
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