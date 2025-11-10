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

    const tripMonth = new Date(profile.trip_start_date).toLocaleDateString('en-US', { month: 'long' });
    const randomSeed = Date.now();

    const prompt = `As a travel expert with deep knowledge of Indian and international destinations, analyze the following traveler profile and recommend 6 diverse destinations that PERFECTLY match their unique preferences and constraints.

CRITICAL INSTRUCTIONS:
- Think deeply about seasonal weather, local events, and travel logistics
- Consider flight availability and costs from the start city
- Balance between popular destinations and hidden gems
- Ensure true diversity: mix Indian (domestic) and international options appropriately for the budget
- Each recommendation should be UNIQUELY suited to this specific traveler profile
- Randomization seed: ${randomSeed} (use this to ensure variety in recommendations)

TRAVELER PROFILE:
┌─────────────────────────────────────────────────────────┐
│ Basic Information                                        │
├─────────────────────────────────────────────────────────┤
│ Starting From: ${profile.start_city}
│ Travel Period: ${profile.trip_start_date} to ${profile.trip_end_date}
│ Duration: ${tripDuration} days in ${tripMonth}
│ Traveling With: ${profile.travel_purpose}
│ Budget Range: ₹${profile.budget_min.toLocaleString('en-IN')} - ₹${profile.budget_max.toLocaleString('en-IN')}
├─────────────────────────────────────────────────────────┤
│ Travel Style & Preferences                              │
├─────────────────────────────────────────────────────────┤
│ Accommodation: ${profile.accommodation_style}
│ Dining Style: ${profile.dining_preference}
│ Travel Pace: ${profile.travel_pace}
│ Preferred Activities: ${profile.preferred_activities.join(', ')}
│ Special Interests: ${profile.special_interests.join(', ')}
${profile.dietary_restrictions ? `│ Dietary Restrictions: ${profile.dietary_restrictions}` : ''}
${profile.accessibility_requirements ? `│ Accessibility Needs: ${profile.accessibility_requirements}` : ''}
└─────────────────────────────────────────────────────────┘

REASONING PROCESS:
1. Analyze the travel dates and consider weather patterns for each potential destination
2. Calculate realistic flight/travel costs from ${profile.start_city}
3. Match activities and interests to destination strengths
4. Consider the travel pace and plan destinations accordingly
5. Factor in accommodation and dining preferences
6. Ensure budget feasibility including all costs (transport, stay, food, activities)
7. Provide diverse options across different regions and experience types

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
[
  {
    "name": "Exact Destination Name",
    "country": "Country Name",
    "state": "State/Region Name",
    "description": "2-3 compelling sentences explaining why this destination is PERFECT for this traveler's specific preferences, considering weather in ${tripMonth} and their interests",
    "estimatedBudget": <realistic total cost in INR including flights, accommodation, food, activities>,
    "bestFor": ["Activity 1 from their preferences", "Activity 2", "Activity 3"],
    "distanceFromStart": "Approximate distance/flight time from ${profile.start_city}",
    "matchScore": <0-100 score based on how well it matches ALL criteria>
  }
]

Ensure all 6 destinations are DIFFERENT from each other, realistic, and genuinely match this specific profile. Mix domestic and international based on budget constraints.`;

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "o1-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 10000,
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

    console.log(`Successfully parsed ${destinations.length} destinations, fetching images...`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const destinationsWithImages = await Promise.all(
      destinations.map(async (destination: any) => {
        try {
          const imageResponse = await fetch(
            `${supabaseUrl}/functions/v1/fetch-destination-image`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                destinationName: destination.name,
                country: destination.country,
              }),
            }
          );

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            return {
              ...destination,
              heroImageUrl: imageData.imageUrl,
              imagePhotographer: imageData.photographer,
              imagePhotographerUrl: imageData.photographerUrl,
            };
          }
        } catch (imageError) {
          console.error(`Error fetching image for ${destination.name}:`, imageError);
        }

        return {
          ...destination,
          heroImageUrl: `https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920`,
          imagePhotographer: "Pexels",
          imagePhotographerUrl: "https://www.pexels.com"
        };
      })
    );

    console.log(`All destinations enhanced with images`);

    return new Response(
      JSON.stringify({
        destinations: destinationsWithImages,
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