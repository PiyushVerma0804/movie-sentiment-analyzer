/**
 * @file tmdbService.js
 * @description Service layer for interacting with the TMDb API.
 * Responsible for fetching movie details, reviews, and other external movie data.
 */

import { env } from '@/config/env';
import { TMDB_BASE_URL } from '@/config/constants';

/**
 * Generic helper to make TMDb API requests with authorization.
 */
async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

    // Inject api_key directly into query params
    const searchParams = new URLSearchParams({
        ...params,
        api_key: env.TMDB_API_KEY
    });

    url.search = searchParams.toString();

    let response;
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        });
    } catch (err) {
        throw new Error(`Fetch Exception: ${err.message}`);
    }

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
            `TMDb API Error: ${response.status} ${response.statusText} - ${errorBody}`
        );
    }

    return response.json();
}

/**
 * Fetches the internal TMDb ID using an IMDb ID.
 * @param {string} imdbId - The IMDb ID (e.g., 'tt1234567')
 * @returns {Promise<number>} - The internal TMDb ID
 */
export async function getTmdbIdFromImdb(imdbId) {
    const data = await tmdbFetch(`/find/${imdbId}`, {
        external_source: 'imdb_id'
    });

    const movieResults = data.movie_results || [];
    if (movieResults.length === 0) {
        throw new Error(`No TMDb movie found for IMDb ID: ${imdbId}`);
    }

    return movieResults[0].id;
}

/**
 * Fetches core movie details given a TMDb ID.
 * @param {number|string} tmdbId - The internal TMDb ID
 * @returns {Promise<object>} - A clean structure with title, year, overview, and poster path
 */
export async function getMovieDetails(tmdbId) {
    const data = await tmdbFetch(`/movie/${tmdbId}`);

    return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        releaseDate: data.release_date,
        releaseYear: data.release_date ? data.release_date.split('-')[0] : null,
        posterPath: data.poster_path,
        genres: data.genres?.map(g => g.name) || [],
        voteAverage: data.vote_average
    };
}

/**
 * Fetches community reviews for a given movie.
 * @param {number|string} tmdbId - The internal TMDb ID
 * @param {number} [page=1] - Optional page number
 * @returns {Promise<Array<object>>} - A clean list of review objects (author, content, rating)
 */
export async function getMovieReviews(tmdbId, page = 1) {
    const data = await tmdbFetch(`/movie/${tmdbId}/reviews`, { page });

    const results = data.results || [];

    return results.map(review => ({
        id: review.id,
        author: review.author,
        content: review.content,
        rating: review.author_details?.rating || null,
        createdAt: review.created_at
    }));
}

/**
 * Fetches the primary cast and crew for a movie.
 * @param {number|string} tmdbId - The internal TMDb ID
 * @returns {Promise<object>} - Top cast and key crew members
 */
export async function getMovieCredits(tmdbId) {
    const data = await tmdbFetch(`/movie/${tmdbId}/credits`);

    // Return top 10 cast members
    const topCast = (data.cast || [])
        .slice(0, 10)
        .map(member => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profilePath: member.profile_path
        }));

    // Find directors
    const directors = (data.crew || [])
        .filter(member => member.job === 'Director')
        .map(member => ({
            id: member.id,
            name: member.name
        }));

    return {
        cast: topCast,
        directors
    };
}
