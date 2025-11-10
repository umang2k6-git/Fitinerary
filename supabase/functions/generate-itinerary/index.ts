import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  destination: string;
  tripBrief: string;
  destinationImageUrl?: string;
  isGuest?: boolean;
}

interface UserProfile {
  travel_purpose: string;
  budget_min: number;
  budget_max: number;
  accommodation_style: string;
  dining_preference: string;
  travel_pace: string;
  accessibility_requirements: string;
  dietary_restrictions: string;
  preferred_activities: string[];
  special_interests: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { destination, tripBrief, destinationImageUrl, isGuest }: GenerateRequest = await req.json();

    const authHeader = req.headers.get("Authorization");

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let userProfile: UserProfile | null = null;
    let user = null;
    let supabaseClient = null;

    if (!isGuest && authHeader) {
      supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      try {
        const { data: { user: authUser } } = await supabaseClient.auth.getUser();
        user = authUser;

        if (user) {
          const { data: profile } = await supabaseClient
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile && profile.profile_completed) {
            userProfile = profile as UserProfile;
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }

    let prompt = `You are a luxury travel planner creating personalized weekend itineraries. Create THREE distinct 2-day weekend itinerary plans for ${destination}.`;

    if (userProfile) {
      const travelPurposeContext = {
        'Solo': 'solo traveler who enjoys independence and flexibility',
        'Couple': 'romantic couple looking for intimate and memorable experiences',
        'Family': 'family with children, focusing on family-friendly activities'
      };

      const paceContext = {
        'relaxed': '1-2 activities per day with plenty of downtime',
        'moderate': '2-3 activities per day with balanced pacing',
        'packed': '3+ activities per day for maximum exploration'
      };

      const accommodationContext = {
        'budget': 'budget-friendly hostels and budget hotels',
        'mid-range': 'comfortable boutique hotels and 3-star properties',
        'luxury': 'premium 5-star hotels and luxury resorts',
        'unique': 'unique stays like homestays, villas, or heritage properties'
      };

      const diningContext = {
        'street-food': 'authentic street food and local eateries',
        'mix': 'a mix of local eateries and upscale dining',
        'fine-dining': 'fine dining and upscale restaurants',
        'authentic': 'authentic local culinary experiences'
      };

      prompt += `\n\nTraveler Profile:
- Traveling as: ${travelPurposeContext[userProfile.travel_purpose as keyof typeof travelPurposeContext]}
- Budget range: ₹${userProfile.budget_min.toLocaleString()} - ₹${userProfile.budget_max.toLocaleString()}
- Preferred accommodation: ${accommodationContext[userProfile.accommodation_style as keyof typeof accommodationContext]}
- Dining preference: ${diningContext[userProfile.dining_preference as keyof typeof diningContext]}
- Travel pace: ${paceContext[userProfile.travel_pace as keyof typeof paceContext]}`;

      if (userProfile.special_interests && userProfile.special_interests.length > 0) {
        prompt += `\n- Special interests: ${userProfile.special_interests.join(', ')}`;
      }

      if (userProfile.preferred_activities && userProfile.preferred_activities.length > 0) {
        prompt += `\n- Preferred activities: ${userProfile.preferred_activities.join(', ')}`;
      }

      if (userProfile.dietary_restrictions) {
        prompt += `\n- Dietary restrictions: ${userProfile.dietary_restrictions}`;
      }

      if (userProfile.accessibility_requirements) {
        prompt += `\n- Accessibility requirements: ${userProfile.accessibility_requirements}`;
      }

      prompt += `\n\nIMPORTANT:
- Personalize ALL activities to match the traveler's interests and preferences
- For couples, include romantic venues and experiences
- For families, ensure all activities are child-friendly and engaging for all ages
- For solo travelers, include opportunities for social interaction and self-discovery
- Adjust activity pacing according to their preferred travel pace
- Match accommodation and dining suggestions to their stated preferences
- Incorporate their special interests throughout the itinerary`;
    } else if (tripBrief) {
      prompt += `\n\nTraveler notes: "${tripBrief}"`;
    }

    prompt += `\n\nFor each tier (Budget, Balanced, Luxe), provide:
- A different style of experience matching the budget level
- Specific venue names, not generic descriptions
- Realistic timing and costs
- Activities that match the traveler's stated preferences${userProfile ? ' and profile' : ''}

Return ONLY valid JSON in this exact structure:
{
  "tiers": [
    {
      "name": "Budget",
      "description": "Smart spending, big experiences",
      "totalCost": 8000,
      "accommodation": "Boutique guesthouses",
      "dining": "Local eateries & street food",
      "days": [
        {
          "day": 1,
          "date": "Saturday",
          "activities": [
            {
              "timeOfDay": "Morning",
              "time": "9:00 AM",
              "name": "Activity name",
              "venue": "Specific venue name",
              "location": "Area/neighborhood",
              "description": "What you'll experience",
              "duration": "2 hours",
              "cost": 500
            }
          ]
        }
      ]
    }
  ]
}

`;

    if (userProfile) {
      const budgetRange = Math.round((userProfile.budget_min + userProfile.budget_max) / 2);
      prompt += `Adjust tier pricing based on user's budget preference (₹${userProfile.budget_min.toLocaleString()} - ₹${userProfile.budget_max.toLocaleString()}):\n`;
      prompt += `- Budget tier: Around ₹${Math.round(budgetRange * 0.4).toLocaleString()}\n`;
      prompt += `- Balanced tier: Around ₹${Math.round(budgetRange * 0.7).toLocaleString()}\n`;
      prompt += `- Luxe tier: Around ₹${Math.round(budgetRange * 1.2).toLocaleString()}\n`;
    } else {
      prompt += `Ensure Budget is ₹6,000-10,000, Balanced is ₹15,000-25,000, Luxe is ₹40,000+.\n`;
    }

    prompt += `Include Morning, Afternoon, and Evening activities for each day.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are a luxury travel planning assistant. Always respond with valid JSON only. Personalize itineraries based on the traveler profile provided." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const itineraryData = JSON.parse(openaiData.choices[0].message.content);

    if (isGuest || !user || !supabaseClient) {
      return new Response(
        JSON.stringify({ tiers: itineraryData.tiers }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const savedItineraries = [];
    for (const tier of itineraryData.tiers) {
      const { data: savedItinerary, error: saveError } = await supabaseClient
        .from("itineraries")
        .insert({
          user_id: user.id,
          destination,
          destination_hero_image_url: destinationImageUrl || null,
          trip_brief: tripBrief,
          tier: tier.name,
          days_json: tier.days,
          total_cost: tier.totalCost,
          duration_days: 2,
        })
        .select()
        .single();

      if (saveError) throw saveError;
      savedItineraries.push({ ...tier, id: savedItinerary.id });
    }

    return new Response(
      JSON.stringify({ tiers: savedItineraries }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
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
