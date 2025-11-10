import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { activityName, venue, location, description } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.log('GEMINI_API_KEY not configured, returning empty images');
      return new Response(
        JSON.stringify({ images: [] }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create a detailed prompt for image generation
    const prompt = `A high-quality, realistic photograph of ${activityName} at ${venue} in ${location}. ${description}. Professional travel photography style, vibrant colors, inviting atmosphere, no text or watermarks.`;

    console.log('Generating image with prompt:', prompt);

    // Call Gemini Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            }
          ],
          parameters: {
            sampleCount: 2,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      
      return new Response(
        JSON.stringify({ images: [] }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    // Extract base64 images from response
    const images: string[] = [];
    
    if (data.predictions && Array.isArray(data.predictions)) {
      for (const prediction of data.predictions) {
        if (prediction.bytesBase64Encoded) {
          images.push(`data:image/png;base64,${prediction.bytesBase64Encoded}`);
        } else if (prediction.mimeType && prediction.bytesBase64Encoded) {
          images.push(`data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`);
        }
      }
    }

    console.log(`Generated ${images.length} images`);

    return new Response(
      JSON.stringify({ images }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        images: [] 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
