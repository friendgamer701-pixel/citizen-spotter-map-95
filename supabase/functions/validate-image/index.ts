import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, imageType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Please analyze this image to determine if it's appropriate for a civic issue report. 
              
              Valid civic issues include:
              - Infrastructure problems (broken roads, sidewalks, streetlights)
              - Public safety concerns (damaged signs, hazardous conditions)
              - Environmental issues (illegal dumping, water leaks)
              - Public facilities problems (broken benches, graffiti on public property)
              
              Invalid images include:
              - Private property issues
              - Personal photos unrelated to civic issues
              - Inappropriate or offensive content
              - Screenshots, memes, or non-photographic content
              - Completely unrelated images (food, pets, selfies, etc.)
              
              Respond with a JSON object containing:
              - "isValid": boolean (true if the image shows a legitimate civic issue)
              - "reason": string (brief explanation of why it's valid/invalid)
              - "confidence": number (0-100, how confident you are in this assessment)
              
              Be strict but fair in your assessment. Only approve images that clearly show civic infrastructure or public space issues.`
            },
            {
              inline_data: {
                mime_type: imageType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      }
    };

    console.log('Sending request to Gemini API for image validation');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response from Gemini
    let validationResult;
    try {
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: analyze the text response
        const isValid = responseText.toLowerCase().includes('valid') && 
                       !responseText.toLowerCase().includes('invalid') &&
                       !responseText.toLowerCase().includes('not valid');
        validationResult = {
          isValid,
          reason: responseText.substring(0, 200),
          confidence: 75
        };
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback validation
      const isValid = responseText.toLowerCase().includes('civic') || 
                     responseText.toLowerCase().includes('infrastructure') ||
                     responseText.toLowerCase().includes('public');
      validationResult = {
        isValid,
        reason: 'AI analysis completed with basic text parsing',
        confidence: 60
      };
    }

    console.log('Validation result:', validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to validate image',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});