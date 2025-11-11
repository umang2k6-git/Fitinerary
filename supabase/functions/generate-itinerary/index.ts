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

    let prompt = `You are an expert travel planner with deep knowledge of destinations worldwide. Analyze the destination and traveler profile, then create THREE meticulously crafted 2-day weekend itinerary tiers for ${destination}.

Think through:
1. What makes ${destination} unique and special?
2. What are the must-see attractions vs hidden gems?
3. How should activities be sequenced for optimal experience?
4. What are realistic costs for each tier level?
5. How can each tier offer distinct value propositions?`;

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

      prompt += `\n\nTRAVELER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traveling as: ${travelPurposeContext[userProfile.travel_purpose as keyof typeof travelPurposeContext]}
Budget range: ₹${userProfile.budget_min.toLocaleString()} - ₹${userProfile.budget_max.toLocaleString()}
Accommodation style: ${accommodationContext[userProfile.accommodation_style as keyof typeof accommodationContext]}
Dining preference: ${diningContext[userProfile.dining_preference as keyof typeof diningContext]}
Travel pace: ${paceContext[userProfile.travel_pace as keyof typeof paceContext]}`;

      if (userProfile.special_interests && userProfile.special_interests.length > 0) {
        prompt += `\nSpecial interests: ${userProfile.special_interests.join(', ')}`;
      }

      if (userProfile.preferred_activities && userProfile.preferred_activities.length > 0) {
        prompt += `\nPreferred activities: ${userProfile.preferred_activities.join(', ')}`;
      }

      if (userProfile.dietary_restrictions) {
        prompt += `\nDietary restrictions: ${userProfile.dietary_restrictions}`;
      }

      if (userProfile.accessibility_requirements) {
        prompt += `\nAccessibility needs: ${userProfile.accessibility_requirements}`;
      }

      prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      prompt += `\n\nCREATE itineraries that PERFECTLY match this profile. Each tier should feel custom-designed for this traveler.`;
    } else {
      prompt += `\n\nTrip context: ${tripBrief}`;
    }

    prompt += `\n\nITINERARY REQUIREMENTS:

For EACH of the THREE tiers (Budget Explorer, Balanced, Luxe), provide:
- Tier-appropriate accommodation and dining recommendations
- Complete 2-day schedule with Day 1 and Day 2 activities
- Time-slotted activities from morning to evening
- SPECIFIC venue/attraction names (real places in ${destination})
- Compelling descriptions that sell the experience
- Realistic estimated costs in INR
- Activities that showcase the destination's unique character

OUTPUT FORMAT (valid JSON only, no markdown):
{
  "tiers": [
    {
      "id": "budget",
      "name": "Budget Explorer",
      "description": "Smart spending without missing the magic",
      "totalCost": <realistic total for 2 days>,
      "accommodation": "Specific type/example for this tier",
      "dining": "Dining style for this tier",
      "days": [
        {
          "day": 1,
          "title": "Day 1: Engaging Title",
          "activities": [
            {
              "time": "09:00 AM",
              "title": "Activity Name",
              "description": "Compelling description of the experience",
              "cost": <cost in INR>,
              "location": "Specific location in ${destination}"
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL:
- All costs must be realistic for ${destination}
- All venues/attractions must be real and accessible
- Activities must be properly sequenced (logical flow)
- Each tier must offer distinctly different value and experiences
- Total costs should clearly differentiate the tiers`;

    const useDetailedModel = userProfile && !isGuest;
    console.log(`Using ${useDetailedModel ? 'gpt-4o (detailed)' : 'gpt-4o-mini (fast)'} model for itinerary generation`);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        useDetailedModel
          ? {
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: 'You are an expert travel planner with deep knowledge of destinations worldwide. Think carefully about each recommendation. Always respond with valid JSON only, no markdown or explanations.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.8,
              max_tokens: 4000,
            }
          : {
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are an expert travel planner. Always respond with valid JSON only, no markdown or explanations.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 3000,
            }
      ),
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

    let finalDestinationImageUrl = destinationImageUrl;

    if (!finalDestinationImageUrl) {
      try {
        console.log(`Fetching hero image for ${destination}...`);
        const supabaseUrl = Deno.env.get("SUPABASE_URL");

        const imageResponse = await fetch(
          `${supabaseUrl}/functions/v1/fetch-destination-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              destinationName: destination,
              country: "India",
            }),
          }
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          finalDestinationImageUrl = imageData.imageUrl;
          console.log(`Successfully fetched hero image for ${destination}`);
        }
      } catch (imageError) {
        console.error(`Error fetching hero image for ${destination}:`, imageError);
      }
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
                destination_hero_image_url: finalDestinationImageUrl,
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
                destination_hero_image_url: finalDestinationImageUrl,
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