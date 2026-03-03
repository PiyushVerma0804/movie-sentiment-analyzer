/**
 * @file validateImdb.js
 * @description Pure helper function to validate IMDb IDs.
 * Ensures input format is correct before processing.
 */

export function validateImdb(id) {
    if (typeof id !== 'string') {
        return false;
    }
    const normalized = id.trim().toLowerCase();
    // Matches "tt" followed by exactly 7 or 8 digits
    return /^tt\d{7,8}$/.test(normalized);
}
