/**
 * @file aiService.js
 * @description Service layer for interacting with the AI Provider.
 * Responsible for sending prompts and receiving raw sentiment analysis responses.
 */

import { env } from '../../config/env';

/**
 * Sends a batch of movie reviews to the AI provider for sentiment analysis.
 * 
 * @param {string[]} reviews - Array of preprocessed review strings.
 * @returns {Promise<string>} - The raw text response from the AI model.
 */
export async function analyzeSentiment(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error('AI Service Error: No reviews provided for analysis.');
    }

    // Build the structured prompt
    const systemPrompt = `You are a professional movie sentiment analyst.
Analyze the following movie reviews and provide a summary of the audience's primary opinions, the key positive themes, the key negative themes, and an overall classification.

You must output STRICTLY valid JSON matching the exact schema below.
No markdown wrappers, no explanations, no conversational text. Only the JSON object.

{
  "summary": "A concise 2-3 sentence summary of the general consensus.",
  "positiveThemes": ["Theme 1", "Theme 2"],
  "negativeThemes": ["Theme 1", "Theme 2"],
  "classification": "Positive" // Must be exactly one of: "Positive", "Mixed", "Negative"
}`;

    const userPrompt = `Reviews to analyze:\n\n${reviews.map((r, i) => `Review ${i + 1}:\n${r}`).join('\n\n')}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // or gpt-4 depending on context/allowances
                temperature: 0.2, // Keep it deterministic
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error('AI Service Error: Invalid response format from OpenAI.');
        }

        return data.choices[0].message.content;

    } catch (error) {
        // If it's already an AI Service Error or OpenAI API request failed error, just throw it.
        throw new Error(`AI Service Error: ${error.message}`);
    }
}
