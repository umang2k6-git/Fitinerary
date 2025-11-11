import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { destinationName, country } = await req.json();

    if (!PEXELS_API_KEY) {
      console.log("PEXELS_API_KEY not configured, returning placeholder");
      return new Response(
        JSON.stringify({
          imageUrl: `https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920`,
          photographer: "Pexels",
          photographerUrl: "https://www.pexels.com"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const searchQuery = `${destinationName} ${country} travel landscape`;
    console.log("Searching Pexels for:", searchQuery);

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape&size=large`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      const fallbackQuery = `${country} travel`;
      console.log("No photos found, trying fallback:", fallbackQuery);

      const fallbackResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(fallbackQuery)}&per_page=5&orientation=landscape&size=large`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.photos && fallbackData.photos.length > 0) {
          const photo = fallbackData.photos[0];
          return new Response(
            JSON.stringify({
              imageUrl: photo.src.large2x || photo.src.large,
              photographer: photo.photographer,
              photographerUrl: photo.photographer_url,
            }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          imageUrl: `https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920`,
          photographer: "Pexels",
          photographerUrl: "https://www.pexels.com"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const photo = data.photos[0];

    return new Response(
      JSON.stringify({
        imageUrl: photo.src.large2x || photo.src.large,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching destination image:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        imageUrl: `https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920`,
        photographer: "Pexels",
        photographerUrl: "https://www.pexels.com"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});