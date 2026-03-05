/**
 * @file validateImdb.test.js
 * @description Unit tests for the validateImdb util.
 */

import { validateImdb } from '@/utils/validateImdb';

describe('validateImdb', () => {
    it('should return true for valid 7-digit IDs', () => {
        expect(validateImdb('tt1234567')).toBe(true);
    });

    it('should return true for valid 8-digit IDs', () => {
        expect(validateImdb('tt12345678')).toBe(true);
    });

    it('should return false for missing "tt" prefix', () => {
        expect(validateImdb('1234567')).toBe(false);
    });

    it('should return false for IDs that are too short', () => {
        expect(validateImdb('tt123456')).toBe(false);
    });

    it('should return false for IDs that are too long', () => {
        expect(validateImdb('tt123456789')).toBe(false);
    });

    it('should return false for letters inside digits', () => {
        expect(validateImdb('tt1234a67')).toBe(false);
    });

    it('should return false for empty string', () => {
        expect(validateImdb('')).toBe(false);
    });

    it('should return false for null', () => {
        expect(validateImdb(null)).toBe(false);
    });

    it('should return false for undefined', () => {
        expect(validateImdb(undefined)).toBe(false);
    });

    it('should return false for non-string values', () => {
        expect(validateImdb(1234567)).toBe(false);
        expect(validateImdb({})).toBe(false);
        expect(validateImdb([])).toBe(false);
        expect(validateImdb(true)).toBe(false);
    });

    it('should return false for random strings', () => {
        expect(validateImdb('randomstring')).toBe(false);
        expect(validateImdb('ttabcdefgh')).toBe(false);
    });

    it('should return false if "tt" is uppercase', () => {
        expect(validateImdb('TT1234567')).toBe(false);
    });
});
