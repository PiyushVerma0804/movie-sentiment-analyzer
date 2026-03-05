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
        classification: "Unavailable",
        positivePercent: 50,
        negativePercent: 50,
        reviewSnippets: {
            positive: null,
            negative: null
        }
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

        // Process Summary
        const summary = (typeof parsed.summary === 'string' && parsed.summary.trim() !== '') ? parsed.summary.trim() : fallback.summary;

        // Process Themes
        const parseThemes = (themes) => {
            if (!themes || !Array.isArray(themes)) return [];
            return themes
                .filter(t => typeof t === 'string')
                .map(t => t.trim())
                .filter(t => t !== '');
        };

        const positiveThemes = parseThemes(parsed.themes?.positive);
        const negativeThemes = parseThemes(parsed.themes?.negative);

        // Process Classification
        let classification = fallback.classification;
        if (typeof parsed.overall === 'string') {
            classification = parsed.overall.trim().toLowerCase();
            classification = classification.charAt(0).toUpperCase() + classification.slice(1);
            if (!['Positive', 'Mixed', 'Negative'].includes(classification)) {
                classification = fallback.classification;
            }
        }

        // Process Percentages (Don't trust blindly)
        let posPct = typeof parsed.positivePercent === 'number' ? parsed.positivePercent : 50;
        let negPct = typeof parsed.negativePercent === 'number' ? parsed.negativePercent : 50;

        // Ensure they add up to 100
        const total = posPct + negPct;
        if (total > 0 && total !== 100) {
            posPct = Math.round((posPct / total) * 100);
            negPct = 100 - posPct;
        } else if (total === 0) {
            posPct = 50;
            negPct = 50;
        }

        // Process Review Snippets (Normalize length)
        const normalizeSnippet = (snippet) => {
            if (typeof snippet !== 'string' || snippet.trim() === '') return null;
            let text = snippet.trim();
            if (text.length > 150) {
                text = text.substring(0, 147) + "...";
            }
            return text;
        };

        const reviewSnippets = {
            positive: normalizeSnippet(parsed.reviewSnippets?.positive),
            negative: normalizeSnippet(parsed.reviewSnippets?.negative)
        };

        return {
            summary,
            positiveThemes,
            negativeThemes,
            classification,
            positivePercent: posPct,
            negativePercent: negPct,
            reviewSnippets
        };
    } catch (error) {
        console.warn("[Parse Error] Failed to parse AI response:", error.message);
        return fallback;
    }
}
