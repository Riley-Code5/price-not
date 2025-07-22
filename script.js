import askQuestion from "./ai.js";
import findSensibleAmazonProduct from "./amazonParse.js";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("resultsContainer");

searchButton.addEventListener("click", async () => {
  const question = searchInput.value.trim();
  
  if (!question) {
    resultsContainer.innerHTML = "<pre>Please enter a question.</pre>";
    return;
  }

  resultsContainer.innerHTML = "Searching...";

  try {
    // Get AI response
    const response = await askQuestion(question);
    resultsContainer.innerHTML = `<pre>${response}</pre>`;

    // Call your Netlify function instead of SerpAPI directly
    const amazonResponse = await fetch('/.netlify/functions/amazon-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: question })
    });

    if (!amazonResponse.ok) {
      throw new Error(`HTTP error! status: ${amazonResponse.status}`);
    }

    const amazonData = await amazonResponse.json();
    
    // Handle errors from your function
    if (amazonData.error) {
      console.error('Function returned error:', amazonData);
      throw new Error(`Function error: ${amazonData.message || amazonData.error}`);
    }

    const amazonResult = await findSensibleAmazonProduct(amazonData);
    
    if (amazonResult) {
      resultsContainer.innerHTML += `<h2>Amazon Product:</h2><pre>${JSON.stringify(amazonResult, null, 2)}</pre>`;
    } else {
      resultsContainer.innerHTML += "<p>No sensible Amazon product found.</p>";
    }

  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `<pre>Error: ${error.message}</pre>`;
  }
});