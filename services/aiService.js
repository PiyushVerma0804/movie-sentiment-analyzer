/**
 * @file aiService.js
 * @description Service layer for interacting with the AI Provider.
 * Responsible for sending prompts and receiving raw sentiment analysis responses.
 */

import { env } from '@/config/env';

/**
 * Sends a batch of movie reviews to the AI provider for sentiment analysis.
 * 
 * @param {string[]} reviews - Array of preprocessed review strings.
 * @returns {Promise<string>} - The raw text response from the AI model.
 */
export async function analyzeSentiment(reviews, retryCount = 0) {
    if (!env.GEMINI_API_KEY) {
        throw new Error('AI_CONFIG_ERROR');
    }

    if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error('AI Service Error: No reviews provided for analysis.');
    }

    const promptText = `You are a movie audience sentiment analyst.

Analyze the following audience reviews.

Tasks:
1. Classify each review as Positive, Negative, or Neutral.
2. Estimate the percentage of positive vs negative sentiment.
3. Extract 3 key positive themes.
4. Extract 3 key negative themes.
5. Return one representative positive review snippet.
6. Return one representative negative review snippet.

Be objective and do not assume the movie is good.

Return ONLY JSON in this EXACT format:

{
  "positivePercent": number,
  "negativePercent": number,
  "overall": "positive | mixed | negative",
  "summary": "A concise 2-3 sentence summary describing overall audience sentiment.",
  "themes": {
    "positive": ["short theme 1", "short theme 2", "short theme 3"],
    "negative": ["short theme 1", "short theme 2", "short theme 3"]
  },
  "reviewSnippets": {
    "positive": "short quote from reviews",
    "negative": "short quote from reviews"
  }
}

Rules for the JSON:
- Output STRICT JSON only.
- No explanations, markdown, or extra fields.
- Percentages must reflect reality, do not arbitrarily guess.
- Snippets must be actual quotes from the provided text.

Audience reviews:

${reviews.join("\\n\\n")}`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: promptText
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            if (response.status === 503) {
                if (retryCount < 1) {
                    console.warn(`[AI Service] 503 Overloaded. Retrying in 2 seconds... (Attempt ${retryCount + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return analyzeSentiment(reviews, retryCount + 1);
                }
                throw new Error("AI_SERVICE_OVERLOADED");
            }
            if (response.status === 429) {
                throw new Error("AI_RATE_LIMIT");
            }
            if (response.status >= 500) {
                throw new Error("AI_SERVER_ERROR");
            }
            throw new Error("AI_REQUEST_FAILED");
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
            throw new Error('AI Service Error: Invalid response format from Gemini.');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error("AI_NETWORK_ERROR");
        }

        // Rethrow classified custom errors directly
        if (["AI_SERVICE_OVERLOADED", "AI_RATE_LIMIT", "AI_SERVER_ERROR", "AI_REQUEST_FAILED", "AI_CONFIG_ERROR", "AI_NETWORK_ERROR"].includes(error.message)) {
            throw error;
        }

        throw new Error(`AI Service Error: ${error.message}`);
    }
}
