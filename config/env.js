/**
 * @file env.js
 * @description Environment variable validation and export module.
 * Ensures that the application fails fast if required configurations are missing.
 */

const requiredEnvs = ['TMDB_API_KEY', 'GEMINI_API_KEY'];

requiredEnvs.forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
});

export const env = {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    // Optional variables can be added here with default fallbacks
    NODE_ENV: process.env.NODE_ENV || 'development',
};
