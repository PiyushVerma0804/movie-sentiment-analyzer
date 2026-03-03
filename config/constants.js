/**
 * @file constants.js
 * @description Centralized configuration variables, environment variable mappings, 
 * and magic strings used across the application.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const MAX_REVIEWS_TO_ANALYZE = 10;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// TODO: Add more configuration constants as needed
