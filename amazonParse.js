/**
 * Parses Amazon search results (JSON) to find the most sensible product.
 *
 * Sensible is defined by:
 * 1. Highest rating (priority 1)
 * 2. Most reviews (priority 2)
 * 3. Best keyword match in title (priority 3)
 * 4. Not a "Generic" brand (priority 4)
 * 5. "Bought last month" indicator (priority 5)
 * 6. Price (less weighted)
 *
 * @param {object} jsonData The JSON data from an Amazon search API result.
 * @param {string[]} searchTerms An array of keywords used in the original search.
 * @returns {object|null} The most sensible product found, or null if no suitable product is found.
 */
export default function findSensibleAmazonProduct(jsonData, searchTerms) {
    let products = [];

    // Combine products from 'product_ads', 'organic_results', and 'video_results'
    if (jsonData && typeof jsonData === 'object') {
        if (jsonData.product_ads && jsonData.product_ads.products) {
            products = products.concat(jsonData.product_ads.products);
        }
        if (jsonData.organic_results) {
            products = products.concat(jsonData.organic_results);
        }
        if (jsonData.video_results) {
            jsonData.video_results.forEach(videoBlock => {
                if (videoBlock.products) {
                    products = products.concat(videoBlock.products);
                }
            });
        }
    }

    if (products.length === 0) {
        console.log("No products found in the provided JSON data.");
        return null;
    }

    // Normalize search terms for comparison
    const normalizedSearchTerms = searchTerms.map(term => term.toLowerCase());

    let bestProduct = null;
    let bestScore = -1;

    // Iterate through each product to calculate its score
    products.forEach(product => {
        let score = 0;

        // Initialize default values for missing keys to avoid undefined errors
        const rating = product.rating || 0.0;
        const reviews = product.reviews || 0;
        const title = (product.title || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const boughtLastMonth = product.bought_last_month;
        const price = product.extracted_price;
        const isSponsored = product.sponsored || false;

        // --- Scoring Logic ---

        // 1. Rating (High priority: 50 points per point of rating above 3.0)
        if (rating >= 3.0) {
            score += (rating - 3.0) * 50;
        }

        // 2. Number of Reviews (High priority: logarithmic scale to reward many reviews)
        // Cap review score to prevent single product dominance from extremely high review counts
        if (reviews > 0) {
            score += Math.min(reviews / 100, 100);
        }

        // 3. Keyword Match in Title (Medium priority: 10 points per matching keyword)
        const matchCount = normalizedSearchTerms.filter(term => title.includes(term)).length;
        score += matchCount * 10;

        // 4. Not a "Generic" Brand (Medium priority: 20 points)
        if (brand && !brand.includes("generic")) {
            score += 20;
        }

        // 5. "Bought Last Month" indicator (Medium priority: 15 points)
        if (boughtLastMonth) {
            score += 15;
        }

        // 6. Price (Low priority: penalize very high prices, reward reasonable prices)
        if (typeof price === 'number') {
            if (price < 20) { // Potentially too cheap, might indicate lower quality
                score -= 5;
            } else if (price > 100) { // Potentially too expensive for a "sensible" general item
                score -= 10;
            } else {
                score += 5; // Reward for being in a typical range
            }
        }

        // Prioritize non-sponsored results slightly if scores are close
        if (isSponsored) {
            score -= 5; // Small penalty for sponsored products
        }

        // Update best product if current product has a higher score
        if (score > bestScore) {
            bestScore = score;
            bestProduct = product;
        }
    });

    if (bestProduct) {
        console.log(`Best product found (Score: ${bestScore.toFixed(2)}):`);
        console.log(`  Title: ${bestProduct.title || 'N/A'}`);
        console.log(`  Brand: ${bestProduct.brand || 'N/A'}`);
        console.log(`  Rating: ${bestProduct.rating || 'N/A'} (${bestProduct.reviews || 'N/A'} reviews)`);
        console.log(`  Price: ${bestProduct.price || bestProduct.extracted_price || 'N/A'}`);
        console.log(`  Link: ${bestProduct.link_clean || bestProduct.link || 'N/A'}`);
        return bestProduct;
    } else {
        console.log("Could not determine a sensible product.");
        return null;
    }
}
