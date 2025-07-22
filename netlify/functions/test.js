// netlify/functions/test.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      message: 'Function works!',
      hasSerpapiKey: !!process.env.SERPAPI_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      method: event.httpMethod,
      body: event.body
    })
  };
};