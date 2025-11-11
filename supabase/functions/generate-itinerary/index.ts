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
  useProfile?: boolean;
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
    const { destination, tripBrief, destinationImageUrl, isGuest, useProfile }: GenerateRequest = await req.json();

    const authHeader = req.headers.get("Authorization");

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let userProfile: UserProfile | null = null;
    let user = null;
    let supabaseClient = null;

    if (!isGuest && authHeader && useProfile) {
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

      prompt += `\n\nTailor each tier to these specific preferences.`;
    } else {
      prompt += `\n\nTrip context: ${tripBrief}`;
    }

    prompt += `\n\nFor each tier (Budget, Balanced, Premium), provide:
1. Comprehensive 2-day itinerary with Day 1 and Day 2 schedules
2. Time-slot activities from morning to night
3. Specific venue/attraction names and brief descriptions
4. Estimated costs in INR
5. Accommodation and dining details appropriate for the tier

Return ONLY a valid JSON object in this exact format:
{
  "tiers": [
    {
      "id": "budget",
      "name": "Budget Explorer",
      "description": "Affordable experiences without compromising on fun",
      "totalCost": 8000,
      "accommodation": "Comfortable hostel or budget hotel",
      "dining": "Local eateries and street food",
      "days": [
        {
          "day": 1,
          "title": "Day 1: Arrival & Exploration",
          "activities": [
            {
              "time": "09:00 AM",
              "title": "Breakfast at Local Cafe",
              "description": "Start with authentic local breakfast",
              "cost": 200,
              "location": "City Center"
            }
          ]
        }
      ]
    }
  ]
}

Ensure all costs are realistic for Indian destinations and activities are practical and achievable.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner. Always respond with valid JSON only, no markdown or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    let itineraryData;

    try {
      const content = openAIData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[0]);
      } else {
        itineraryData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', openAIData.choices[0].message.content);
      throw new Error('Failed to parse itinerary data');
    }

    if (user && supabaseClient && !isGuest) {
      try {
        for (const tier of itineraryData.tiers) {
          const { data: existingItinerary } = await supabaseClient
            .from('itineraries')
            .select('id')
            .eq('user_id', user.id)
            .eq('destination', destination)
            .eq('tier', tier.name)
            .maybeSingle();

          if (existingItinerary) {
            await supabaseClient
              .from('itineraries')
              .update({
                days_json: tier.days,
                total_cost: tier.totalCost,
                destination_hero_image_url: destinationImageUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingItinerary.id);

            tier.id = existingItinerary.id;
          } else {
            const { data: newItinerary } = await supabaseClient
              .from('itineraries')
              .insert({
                user_id: user.id,
                destination,
                destination_hero_image_url: destinationImageUrl,
                tier: tier.name,
                days_json: tier.days,
                total_cost: tier.totalCost,
              })
              .select('id')
              .single();

            tier.id = newItinerary?.id;
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return new Response(
      JSON.stringify(itineraryData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});