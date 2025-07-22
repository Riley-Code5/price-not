/**
 * Asks a question to the AI.
 *
 * @param {string} question The user's search query.
 * @returns {Promise<string>} A promise that resolves to the AI's answer or an error message.
 */
export default async function askQuestion(question) {

    const queryTags = ["beauty", "clothing", "electronics", "furniture", "home", "kitchen", "toys", "sports", "outdoors", "books", "music", "movies", "games", "tools", "appliances", "jewelry", "accessories", "pets", "health", "grocery", "baby", "automotive", "office", "garden", "art", "crafts", "collectibles", "handmade", "vintage", "seasonal", "travel", "services", "digital", "software", "subscriptions", "events", "tickets", "real estate", "rentals", "vehicles", "parts", "supplies", "equipment", "materials", "components", "wholesale", "retail", "b2b", "b2c", "c2c", "local", "global", "luxury", "discount", "premium", "eco-friendly", "sustainable", "organic", "handcrafted", "customizable", "limited edition", "exclusive", "rare", "unique", "popular", "trending", "new arrivals", "best sellers", "clearance", "sale", "offerings", "bundles", "kits", "sets", "collections", "themes", "styles", "colors", "sizes", "materials", "brands", "manufacturers", "distributors", "wholesalers", "retailers", "sellers", "buyers", "consumers", "markets", "industries", "sectors", "niches", "segments", "audiences", "demographics", "psychographics", "behaviors", "preferences", "needs", "wants", "desires", "trends", "patterns", "insights", "analytics", "data", "statistics", "metrics", "KPIs", "ROI", "value propositions", "USPs", "features", "benefits", "advantages", "disadvantages", "comparisons", "alternatives", "substitutes", "competitors", "marketplaces", "platforms", "channels", "networks", "ecosystems", "communities", "forums", "groups", "associations", "organizations", "institutions", "agencies", "governments", "NGOs", "non-profits", "foundations", "charities", "philanthropies", "volunteers", "donors", "sponsors", "partners", "collaborators", "alliances", "coalitions", "unions", "associations", "societies", "clubs", "teams", "leagues", "events", "conferences", "exhibitions", "fairs", "festivals", "gatherings"];
    // The API key for gemini-2.0-flash is automatically provided by the Canvas environment
    // when set as an empty string. DO NOT hardcode your API key here.
    const apiKey = "AIzaSyDtFuBd8NjI7TvNNNsfOd_NAfkh8mJDcvE";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt_text = `
        You are a helpful shopping Assistant. The user will provide a description of an item and you will respond with tags that could be used on a database. These include ${queryTags}.
        What tags fit this description: "${question}"?
        Please provide the tags in an array format, without any additional text or explanation.
        For example, if the description is "A red dress", you might respond with ["clothing", "fashion", "dress", "red"].
    `;

    // Prepare the payload for the Gemini API request.
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

    try {
        // AWAIT the fetch call to get the response.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // AWAIT parsing the JSON response.
        const result = await response.json();

        // Check for candidates and extract the text.
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            // Directly return the generated text.
            return result.candidates[0].content.parts[0].text;
        } else {
            // If no valid candidates or unexpected structure, log the full response
            // for debugging and return a generic error message.
            console.error("API response did not contain valid candidates or expected structure:", result);
            return "No results.";
        }
    } catch (error) {
        // Catch any network errors or other exceptions during the API call.
        console.error("Error during API call:", error);
        // Return a user-friendly error message.
        return `An unexpected error occurred: ${error.message}. Perhaps the game is rigged.`;
    }
}