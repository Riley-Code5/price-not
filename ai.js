/**
 * Asks a question to the AI via Netlify function.
 *
 * @param {string} question The user's search query.
 * @returns {Promise<string>} A promise that resolves to the AI's answer or an error message.
 */
export default async function askQuestion(question) {
    try {
        // Call your Netlify function instead of directly calling Gemini API
        const response = await fetch('/.netlify/functions/ask-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Handle errors from your function
        if (result.error) {
            throw new Error(result.error);
        }

        // Return the AI response
        return result.response || "No results.";

    } catch (error) {
        // Catch any network errors or other exceptions during the API call
        console.error("Error during AI API call:", error);
        // Return a user-friendly error message
        return `An unexpected error occurred: ${error.message}. Perhaps the game is rigged.`;
    }
}