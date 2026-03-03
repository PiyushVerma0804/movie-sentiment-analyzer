/**
 * @file parseAIResponse.js
 * @description Pure helper function to parse and structure the raw response from the AI.
 * Ensures the final output matches the expected schema for the frontend.
 */

export function parseAIResponse(rawResponse) {
    const fallback = {
        summary: "Sentiment analysis is currently unavailable.",
        positiveThemes: [],
        negativeThemes: [],
        classification: "Unavailable"
    };

    if (typeof rawResponse !== 'string') {
        return fallback;
    }

    try {
        // Attempt to extract JSON if wrapped in markdown code blocks
        let jsonString = rawResponse;
        const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonString.trim());

        // Validate summary
        if (typeof parsed.summary !== 'string' || parsed.summary.trim() === '') {
            return fallback;
        }

        // Validate and process themes
        const parseThemes = (themes) => {
            if (!Array.isArray(themes)) return null;
            return themes
                .filter(t => typeof t === 'string')
                .map(t => t.trim())
                .filter(t => t !== '');
        };

        const positiveThemes = parseThemes(parsed.positiveThemes);
        const negativeThemes = parseThemes(parsed.negativeThemes);

        if (positiveThemes === null || negativeThemes === null) {
            return fallback;
        }

        // Validate and normalize classification
        if (typeof parsed.classification !== 'string') {
            return fallback;
        }

        let classification = parsed.classification.trim().toLowerCase();
        classification = classification.charAt(0).toUpperCase() + classification.slice(1);

        if (!['Positive', 'Mixed', 'Negative'].includes(classification)) {
            return fallback;
        }

        return {
            summary: parsed.summary.trim(),
            positiveThemes,
            negativeThemes,
            classification
        };
    } catch (error) {
        return fallback;
    }
}
