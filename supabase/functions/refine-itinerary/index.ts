import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RefineRequest {
  itineraryId: string;
  userMessage: string;
  currentItinerary: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { itineraryId, userMessage, currentItinerary }: RefineRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: conversationHistory } = await supabaseClient
      .from("conversation_history")
      .select("*")
      .eq("itinerary_id", itineraryId)
      .order("timestamp", { ascending: true });

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const messages = [
      {
        role: "system",
        content: "You are a luxury travel planner refining itineraries. Respond with valid JSON matching the current structure. Keep venue names specific and maintain the overall itinerary format."
      },
      {
        role: "user",
        content: `Current itinerary: ${JSON.stringify(currentItinerary)}\n\nPrevious conversation: ${JSON.stringify(conversationHistory || [])}\n\nUser request: ${userMessage}\n\nModify the itinerary according to the request and return the complete updated itinerary in the same JSON structure.`
      }
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const refinedItinerary = JSON.parse(openaiData.choices[0].message.content);
    const aiResponse = "I've updated your itinerary based on your preferences. Take a look!";

    await supabaseClient
      .from("conversation_history")
      .insert({
        itinerary_id: itineraryId,
        user_message: userMessage,
        ai_response: aiResponse,
      });

    await supabaseClient
      .from("itineraries")
      .update({
        days_json: refinedItinerary.days || refinedItinerary,
        total_cost: refinedItinerary.totalCost || currentItinerary.totalCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itineraryId);

    return new Response(
      JSON.stringify({ 
        itinerary: refinedItinerary,
        message: aiResponse 
      }),
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