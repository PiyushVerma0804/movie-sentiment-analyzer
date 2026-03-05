/**
 * @file route.js
 * @description Next.js App Router API endpoint for sentiment analysis.
 * Acts as a thin orchestration layer that coordinates services, infrastructure, and utils.
 * No heavy business logic should be here.
 */

import { NextResponse } from 'next/server';
import { validateImdb } from '@/utils/validateImdb';
import { checkRateLimit } from '@/lib/rateLimiter';
import { getCache, setCache } from '@/lib/cache';
import {
    getTmdbIdFromImdb,
    getMovieDetails,
    getMovieReviews,
    getMovieCredits
} from '@/services/tmdbService';
import { preprocessReviews } from '@/utils/preprocessReviews';
import { analyzeSentiment } from '@/services/aiService';
import { parseAIResponse } from '@/utils/parseAIResponse';

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
                {
                    error: 'Movie not found.',
                    ...(process.env.NODE_ENV === 'development' && { details: error.message })
                },
                { status: 404 }
            );
        }

        // Sequential fetching to avoid local network ECONNRESET / socket exhaustion
        const movieDetails = await getMovieDetails(tmdbId);
        const reviewsResponse = await getMovieReviews(tmdbId);
        const creditsResponse = await getMovieCredits(tmdbId);

        // 5. Check if we have enough reviews
        // If no reviews -> return movie data with fallback sentiment object
        if (!reviewsResponse || reviewsResponse.length === 0) {
            const fallbackSentiment = {
                overall: "mixed",
                positivePercent: 50,
                negativePercent: 50,
                summary: "Not enough audience reviews were available to generate a reliable sentiment analysis."
            };

            const responsePayload = {
                movie: {
                    ...movieDetails,
                    ...creditsResponse,
                    plot: movieDetails.overview, // Add plot summary
                    poster: movieDetails.posterPath // Map posterPath to poster for frontend
                },
                sentiment: fallbackSentiment,
                themes: {
                    positive: [],
                    negative: []
                },
                // Add representative reviews fallback
                reviewSnippets: {
                    positive: null,
                    negative: null
                }
            };

            // Cache even early exits to prevent repeated heavy hits
            await setCache(cacheKey, responsePayload, 3600); // Cache for 1 hour
            return NextResponse.json(responsePayload, { status: 200 });
        }

        // 6. Preprocess reviews
        const cleanedReviews = preprocessReviews(reviewsResponse);

        // Few reviews guard - prevent bad AI inferences on extremely low data
        if (cleanedReviews.length < 3) {
            const fallbackSentiment = {
                overall: "unavailable",
                positivePercent: 50,
                negativePercent: 50,
                summary: "Sentiment analysis is currently unavailable. Not enough valid reviews found."
            };

            const responsePayload = {
                movie: {
                    ...movieDetails,
                    ...creditsResponse,
                    plot: movieDetails.overview,
                    poster: movieDetails.posterPath
                },
                sentiment: fallbackSentiment,
                themes: {
                    positive: [],
                    negative: []
                },
                reviewSnippets: {
                    positive: null,
                    negative: null
                }
            };

            await setCache(cacheKey, responsePayload, 3600);
            return NextResponse.json(responsePayload, { status: 200 });
        }

        // Fisher-Yates sample function
        const sampleReviews = (reviewsArray, size = 40) => {
            const shuffled = [...reviewsArray];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled.slice(0, size);
        };

        const sampledReviews = sampleReviews(cleanedReviews, 40);

        // 7. Analyze data via aiService
        const rawAiResponse = await analyzeSentiment(sampledReviews);

        // 8. Parse response via parseAIResponse
        const sentimentAnalysis = parseAIResponse(rawAiResponse);

        // 9. Transform data structure to match frontend expectations
        const transformedSentiment = {
            overall: sentimentAnalysis.classification.toLowerCase(),
            positivePercent: sentimentAnalysis.positivePercent, // Extracted securely
            negativePercent: sentimentAnalysis.negativePercent, // Extracted securely
            summary: sentimentAnalysis.summary
        };

        const finalPayload = {
            movie: {
                ...movieDetails,
                ...creditsResponse,
                plot: movieDetails.overview, // Add plot summary
                poster: movieDetails.posterPath // Map posterPath to poster for frontend
            },
            sentiment: transformedSentiment,
            themes: {
                positive: sentimentAnalysis.positiveThemes,
                negative: sentimentAnalysis.negativeThemes
            },
            // Add representative reviews mapped directly
            reviewSnippets: sentimentAnalysis.reviewSnippets
        };

        // Cache final structured response
        await setCache(cacheKey, finalPayload, 86400); // Cache for 24 hours (reviews don't change that fast)

        // 9. Return final JSON response
        return NextResponse.json(finalPayload, { status: 200 });

    } catch (error) {
        // Log internal error to server console, but don't leak stack trace to client
        console.error(`[Analyze API Error]:`, error);

        if (error.message === "AI_SERVICE_OVERLOADED") {
            return NextResponse.json(
                { error: "AI analysis service is currently experiencing high demand. Please try again in a moment." },
                { status: 503 }
            );
        }

        if (error.message === "AI_RATE_LIMIT") {
            return NextResponse.json(
                { error: "Too many AI requests. Please wait before trying again." },
                { status: 429 }
            );
        }

        if (error.message === "AI_SERVER_ERROR") {
            return NextResponse.json(
                { error: "AI service temporarily unavailable." },
                { status: 502 }
            );
        }

        if (error.message === "AI_CONFIG_ERROR") {
            return NextResponse.json(
                { error: "AI service is not configured properly. Missing API key." },
                { status: 500 }
            );
        }

        if (error.message === "AI_NETWORK_ERROR") {
            return NextResponse.json(
                { error: "Network error occurred while contacting the AI service." },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                error: 'An unexpected error occurred during processing.',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            },
            { status: 500 }
        );
    }
}
