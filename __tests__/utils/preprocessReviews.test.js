/**
 * @file preprocessReviews.test.js
 * @description Unit tests for the preprocessReviews util.
 */

import { preprocessReviews } from '../../utils/preprocessReviews';

describe('preprocessReviews', () => {
    describe('A) Invalid input handling', () => {
        it('should return empty array for null', () => {
            expect(preprocessReviews(null)).toEqual([]);
        });

        it('should return empty array for undefined', () => {
            expect(preprocessReviews(undefined)).toEqual([]);
        });

        it('should return empty array for non-array values', () => {
            expect(preprocessReviews(123)).toEqual([]);
            expect(preprocessReviews('string')).toEqual([]);
            expect(preprocessReviews({ key: 'value' })).toEqual([]);
        });
    });

    describe('B) Filtering logic', () => {
        it('should remove reviews shorter than 20 characters', () => {
            const input = [
                'Too short',
                'exactly twenty chars', // exactly 20 chars
                'This is a valid review that is long enough.',
                '1234567890123456789' // 19 chars
            ];
            const result = preprocessReviews(input);
            expect(result).toEqual([
                'exactly twenty chars',
                'This is a valid review that is long enough.'
            ]);
        });

        it('should ignore non-string content', () => {
            const input = [
                { content: 12345678901234567890 }, // Number, but length > 20 if string
                { content: true },
                { content: 'This is a valid review that is definitely long enough.' }
            ];
            // Object parsing falls back to '' if not a string after extraction if item is number etc.
            // Wait, in the implementation: `let text = typeof item === 'string' ? item : (item?.content || item?.text || '');`
            // If item is { content: 123... }, text is 123... typeof text is 'number', which gets rejected.
            const result = preprocessReviews(input);
            expect(result).toEqual(['This is a valid review that is definitely long enough.']);
        });
    });

    describe('C) Extraction logic', () => {
        it('should accept plain strings, content fields, text fields and mixed arrays', () => {
            const input = [
                'This is a plain string review that is long enough.',
                { content: 'This review comes from a content field and is valid.' },
                { text: 'This review comes from a text field and is also valid.' },
                { foo: 'bar' } // No valid text or content field, should be ignored
            ];
            const result = preprocessReviews(input);
            expect(result).toEqual([
                'This is a plain string review that is long enough.',
                'This review comes from a content field and is valid.',
                'This review comes from a text field and is also valid.'
            ]);
        });
    });

    describe('D) Deduplication', () => {
        it('should treat case-insensitive duplicates as duplicates and only keep the first occurrence', () => {
            const input = [
                'This is a unique review that we want to keep.',
                'This is a UNIQUE review that we want to KEEP.',
                { content: 'THIS IS A UNIQUE REVIEW THAT WE WANT TO KEEP.' }
            ];
            const result = preprocessReviews(input);
            expect(result).toEqual([
                'This is a unique review that we want to keep.'
            ]);
        });
    });

    describe('E) Length limiting', () => {
        it('should truncate if the remaining space is >= 20 characters', () => {
            // Create a string of length 9900
            const longReview = 'A'.repeat(9900);

            // The next review has 200 characters. 
            // 9900 + 200 = 10100 > 10000.
            // Remaining space is 100 (which is >= 20), so the next review should be truncated to 100 characters.
            const nextReview = 'B'.repeat(200);

            const input = [longReview, nextReview];
            const result = preprocessReviews(input);

            expect(result).toHaveLength(2);
            expect(result[0]).toBe(longReview);
            expect(result[1]).toBe('B'.repeat(100));
            expect(result.join('').length).toBe(10000);
        });

        it('should discard if the final review exceeds the limit and remaining space is < 20 characters', () => {
            // Create a string of length 9985
            const longReview = 'A'.repeat(9985);

            // The next review has 50 characters.
            // 9985 + 50 = 10035 > 10000.
            // Remaining space is 15 (which is < 20), so the next review should be discarded.
            const nextReview = 'B'.repeat(50);

            const input = [longReview, nextReview];
            const result = preprocessReviews(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(longReview);
            expect(result.join('').length).toBe(9985);
        });

        it('should stop processing entirely once limit is reached', () => {
            const r1 = 'A'.repeat(5000);
            const r2 = 'B'.repeat(5000);
            const r3 = 'C'.repeat(100);

            const input = [r1, r2, r3];
            const result = preprocessReviews(input);

            expect(result).toHaveLength(2);
            expect(result[0]).toBe(r1);
            expect(result[1]).toBe(r2);
            expect(result.join('').length).toBe(10000);
        });
    });
});
