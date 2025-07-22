// netlify/functions/ask-question.js
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { question } = JSON.parse(event.body);
    
    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // Get API key from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gemini API key not configured' })
      };
    }

    const queryTags = ["beauty", "clothing", "electronics", "furniture", "home", "kitchen", "toys", "sports", "outdoors", "books", "music", "movies", "games", "tools", "appliances", "jewelry", "accessories", "pets", "health", "grocery", "baby", "automotive", "office", "garden", "art", "crafts", "collectibles", "handmade", "vintage", "seasonal", "travel", "services", "digital", "software", "subscriptions", "events", "tickets", "real estate", "rentals", "vehicles", "parts", "supplies", "equipment", "materials", "components", "wholesale", "retail", "b2b", "b2c", "c2c", "local", "global", "luxury", "discount", "premium", "eco-friendly", "sustainable", "organic", "handcrafted", "customizable", "limited edition", "exclusive", "rare", "unique", "popular", "trending", "new arrivals", "best sellers", "clearance", "sale", "offerings", "bundles", "kits", "sets", "collections", "themes", "styles", "colors", "sizes", "materials", "brands", "manufacturers", "distributors", "wholesalers", "retailers", "sellers", "buyers", "consumers", "markets", "industries", "sectors", "niches", "segments", "audiences", "demographics", "psychographics", "behaviors", "preferences", "needs", "wants", "desires", "trends", "patterns", "insights", "analytics", "data", "statistics", "metrics", "KPIs", "ROI", "value propositions", "USPs", "features", "benefits", "advantages", "disadvantages", "comparisons", "alternatives", "substitutes", "competitors", "marketplaces", "platforms", "channels", "networks", "ecosystems", "communities", "forums", "groups", "associations", "organizations", "institutions", "agencies", "governments", "NGOs", "non-profits", "foundations", "charities", "philanthropies", "volunteers", "donors", "sponsors", "partners", "collaborators", "alliances", "coalitions", "unions", "associations", "societies", "clubs", "teams", "leagues", "events", "conferences", "exhibitions", "fairs", "festivals", "gatherings"];

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt_text = `
        You are a helpful shopping Assistant. The user will provide a description of an item and you will respond with tags that could be used on a database. These include ${queryTags}.
        What tags fit this description: "${question}"?
        Please provide the tags in an array format, without any additional text or explanation.
        For example, if the description is "A red dress", you might respond with ["clothing", "fashion", "dress", "red"].
    `;

    // Prepare the payload for the Gemini API request
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt_text }]
        }],
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40
        }
    };

    // Make request to Gemini API
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();

    // Check for candidates and extract the text
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        
        const aiResponse = result.candidates[0].content.parts[0].text;
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST'
          },
          body: JSON.stringify({ response: aiResponse })
        };
    } else {
        console.error("API response did not contain valid candidates:", result);
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: "No results from AI" })
        };
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};