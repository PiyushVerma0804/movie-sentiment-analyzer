/**
 * @file preprocessReviews.js
 * @description Pure helper function to clean and format raw review text.
 * Prepares data for optimal AI consumption (e.g., truncating).
 */

export function preprocessReviews(reviews) {
    if (!Array.isArray(reviews)) {
        return [];
    }

    const uniqueReviews = new Set();
    const cleanedReviews = [];
    let totalLength = 0;
    const MAX_LENGTH = 10000;

    for (const item of reviews) {
        if (totalLength >= MAX_LENGTH) {
            break;
        }

        // Extract text from object or use string directly
        let text = typeof item === 'string' ? item : (item?.content || item?.text || '');

        // Ensure we are working with a string
        if (typeof text !== 'string') {
            continue;
        }

        // Trim whitespace and remove completely empty values
        text = text.trim();
        if (!text) {
            continue;
        }

        // Truncate excessively long individual reviews before sending to AI
        if (text.length > 500) {
            text = text.substring(0, 500) + "...";
        }

        // Basic deduplication
        const normalizedText = text.toLowerCase();
        if (uniqueReviews.has(normalizedText)) {
            continue;
        }
        uniqueReviews.add(normalizedText);

        // Limit total combined length to 10000
        if (totalLength + text.length > MAX_LENGTH) {
            const remainingSpace = MAX_LENGTH - totalLength;
            // If we have at least 20 characters of space left, we can truncate and add it
            if (remainingSpace >= 20) {
                cleanedReviews.push(text.substring(0, remainingSpace));
            }
            break;
        }

        cleanedReviews.push(text);
        totalLength += text.length;
    }

    return cleanedReviews;
}
