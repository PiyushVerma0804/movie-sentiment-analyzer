/**
 * @file route.js
 * @description Next.js App Router API endpoint for sentiment analysis.
 * Acts as a thin orchestration layer that coordinates services, infrastructure, and utils.
 * No heavy business logic should be here.
 */

import { NextResponse } from 'next/server';
import { validateImdb } from '../../../utils/validateImdb';
import { checkRateLimit } from '../../../lib/infrastructure/rateLimiter';
import { getCache, setCache } from '../../../lib/infrastructure/cache';
import {
    getTmdbIdFromImdb,
    getMovieDetails,
    getMovieReviews,
    getMovieCredits
} from '../../../lib/services/tmdbService';
import { preprocessReviews } from '../../../utils/preprocessReviews';
import { analyzeSentiment } from '../../../lib/services/aiService';
import { parseAIResponse } from '../../../utils/parseAIResponse';

export async function POST(request) {
    try {
        // 1. Rate limiting check (using IP as identifier for simplicity)
        // Note: In Next.js App Router, getting IP can be tricky depending on hosting, 
        // using a generic identifier or extracting from headers as fallback.
        const ip = request.headers.get('x-forwarded-for') || 'anonymous_user';
        const isAllowed = await checkRateLimit(ip);

        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // 2. Extract and validate request body
        const body = await request.json().catch(() => ({}));
        const rawImdbId = body.imdbId;

        if (!rawImdbId || typeof rawImdbId !== 'string') {
            return NextResponse.json(
                { error: 'Invalid or missing imdbId.' },
                { status: 400 }
            );
        }

        const imdbId = rawImdbId.trim().toLowerCase();

        if (!validateImdb(imdbId)) {
            return NextResponse.json(
                { error: 'Invalid IMDb ID format.' },
                { status: 400 }
            );
        }

        // 3. Cache check
        const cacheKey = `analyze_${imdbId}`;
        const cachedData = await getCache(cacheKey);

        if (cachedData) {
            return NextResponse.json(cachedData, { status: 200 });
        }

        // 4. Fetch data via tmdbService
        let tmdbId;
        try {
            tmdbId = await getTmdbIdFromImdb(imdbId);
        } catch (error) {
            return NextResponse.json(
                { error: 'Movie not found.' },
                { status: 404 }
            );
        }

        // Parallel fetching for performance
        const [movieDetails, reviewsResponse, creditsResponse] = await Promise.all([
            getMovieDetails(tmdbId),
            getMovieReviews(tmdbId),
            getMovieCredits(tmdbId)
        ]);

        // 5. Check if we have enough reviews
        // If no reviews -> return movie data with fallback sentiment object
        if (!reviewsResponse || reviewsResponse.length === 0) {
            const responsePayload = {
                movie: {
                    ...movieDetails,
                    ...creditsResponse
                },
                sentiment: {
                    summary: "Sentiment analysis is currently unavailable. Not enough reviews found.",
                    positiveThemes: [],
                    negativeThemes: [],
                    classification: "Unavailable"
                }
            };

            // Cache even early exits to prevent repeated heavy hits
            await setCache(cacheKey, responsePayload, 3600); // Cache for 1 hour
            return NextResponse.json(responsePayload, { status: 200 });
        }

        // 6. Preprocess reviews
        const cleanedReviews = preprocessReviews(reviewsResponse);

        if (cleanedReviews.length === 0) {
            const responsePayload = {
                movie: {
                    ...movieDetails,
                    ...creditsResponse
                },
                sentiment: {
                    summary: "Sentiment analysis is currently unavailable. No valid reviews found.",
                    positiveThemes: [],
                    negativeThemes: [],
                    classification: "Unavailable"
                }
            };

            await setCache(cacheKey, responsePayload, 3600);
            return NextResponse.json(responsePayload, { status: 200 });
        }

        // 7. Analyze data via aiService
        const rawAiResponse = await analyzeSentiment(cleanedReviews);

        // 8. Parse response via parseAIResponse
        const sentimentAnalysis = parseAIResponse(rawAiResponse);

        const finalPayload = {
            movie: {
                ...movieDetails,
                ...creditsResponse
            },
            sentiment: sentimentAnalysis
        };

        // Cache final structured response
        await setCache(cacheKey, finalPayload, 86400); // Cache for 24 hours (reviews don't change that fast)

        // 9. Return final JSON response
        return NextResponse.json(finalPayload, { status: 200 });

    } catch (error) {
        // Log internal error to server console, but don't leak stack trace to client
        console.error(`[Analyze API Error]:`, error);

        return NextResponse.json(
            { error: 'An unexpected error occurred during processing.' },
            { status: 500 }
        );
    }
}
