/**
 * @file parseAIResponse.test.js
 * @description Unit tests for the parseAIResponse util.
 */

import { parseAIResponse } from '../../utils/parseAIResponse';

describe('parseAIResponse', () => {
    const fallback = {
        summary: "Sentiment analysis is currently unavailable.",
        positiveThemes: [],
        negativeThemes: [],
        classification: "Unavailable"
    };

    describe('A) Perfect valid JSON', () => {
        it('should correctly parse and return perfect JSON', () => {
            const input = JSON.stringify({
                summary: "This is a great movie.",
                positiveThemes: ["Action", "Acting"],
                negativeThemes: ["Pacing"],
                classification: "Positive"
            });
            const expected = {
                summary: "This is a great movie.",
                positiveThemes: ["Action", "Acting"],
                negativeThemes: ["Pacing"],
                classification: "Positive"
            };
            expect(parseAIResponse(input)).toEqual(expected);
        });
    });

    describe('B) Lowercase classification', () => {
        it('should normalize lowercase classification to title case', () => {
            const input = JSON.stringify({
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "positive"
            });
            const result = parseAIResponse(input);
            expect(result.classification).toBe("Positive");
        });

        it('should normalize uppercase classification to title case', () => {
            const input = JSON.stringify({
                summary: "It was okay.",
                positiveThemes: [],
                negativeThemes: [],
                classification: "MIXED"
            });
            const result = parseAIResponse(input);
            expect(result.classification).toBe("Mixed");
        });
    });

    describe('C) Extra fields present', () => {
        it('should ignore extra fields and only return required ones', () => {
            const input = JSON.stringify({
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Positive",
                extraField: "This should be ignored",
                anotherExtra: 123
            });
            const expected = {
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Positive"
            };
            expect(parseAIResponse(input)).toEqual(expected);
        });
    });

    describe('D) Missing required fields', () => {
        it('should return fallback if summary is missing', () => {
            const input = JSON.stringify({
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Positive"
            });
            expect(parseAIResponse(input)).toEqual(fallback);
        });

        it('should return fallback if positiveThemes is missing or non-array', () => {
            const input = JSON.stringify({
                summary: "Good.",
                negativeThemes: [],
                classification: "Positive"
            });
            expect(parseAIResponse(input)).toEqual(fallback);
        });
    });

    describe('E) Invalid classification value', () => {
        it('should return fallback if classification is not Positive, Negative, or Mixed', () => {
            const input = JSON.stringify({
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Awesome" // Invalid
            });
            expect(parseAIResponse(input)).toEqual(fallback);
        });
    });

    describe('F) Malformed JSON', () => {
        it('should return fallback for invalid string formats', () => {
            const input = 'This is literally just a string without JSON formatting';
            expect(parseAIResponse(input)).toEqual(fallback);
        });

        it('should return fallback for broken JSON parsing', () => {
            const input = '{ "summary": "Bad syntax, missing closing brace }';
            expect(parseAIResponse(input)).toEqual(fallback);
        });

        it('should return fallback for null input', () => {
            expect(parseAIResponse(null)).toEqual(fallback);
        });
    });

    describe('G) JSON wrapped in markdown', () => {
        it('should strip markdown codeblocks and parse correctly', () => {
            const input = `\`\`\`json
{
  "summary": "This is a great movie.",
  "positiveThemes": ["Action"],
  "negativeThemes": [],
  "classification": "Positive"
}
\`\`\``;
            const expected = {
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Positive"
            };
            expect(parseAIResponse(input)).toEqual(expected);
        });

        it('should strip markdown codeblocks without the json word definition', () => {
            const input = `\`\`\`
{
  "summary": "This is a great movie.",
  "positiveThemes": ["Action"],
  "negativeThemes": [],
  "classification": "Positive"
}
\`\`\``;
            const expected = {
                summary: "This is a great movie.",
                positiveThemes: ["Action"],
                negativeThemes: [],
                classification: "Positive"
            };
            expect(parseAIResponse(input)).toEqual(expected);
        });
    });

    describe('H) Themes array containing non-strings', () => {
        it('should filter out non-strings in themes arrays and trim valid strings', () => {
            const input = JSON.stringify({
                summary: "This is a great movie.",
                positiveThemes: ["Action", 123, true, null, {}, " Acting "],
                negativeThemes: [false, "Pacing", []],
                classification: "Positive"
            });
            const expected = {
                summary: "This is a great movie.",
                positiveThemes: ["Action", "Acting"], // Filtered out 123, true, null, {}, trimmed " Acting "
                negativeThemes: ["Pacing"], // Filtered out false, []
                classification: "Positive"
            };
            expect(parseAIResponse(input)).toEqual(expected);
        });
    });
});
