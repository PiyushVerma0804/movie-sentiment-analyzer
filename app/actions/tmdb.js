'use server';

import { env } from '@/config/env';
import { TMDB_BASE_URL } from '@/config/constants';

/**
 * Perform a movie search using the TMDb API.
 */
export async function searchMovies(query) {
    if (!query || !query.trim()) return [];

    try {
        const url = new URL(`${TMDB_BASE_URL}/search/movie`);
        url.searchParams.append('query', query);
        url.searchParams.append('api_key', env.TMDB_API_KEY);

        const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

        if (!res.ok) {
            console.error(`TMDb API Error: ${res.status}`);
            return [];
        }

        const data = await res.json();
        return data.results ? data.results.slice(0, 5) : [];
    } catch (error) {
        console.error("Error searching movies:", error);
        return [];
    }
}

/**
 * Get internal TMDb external IDs (including IMDb ID).
 */
export async function getMovieExternalIds(tmdbId) {
    try {
        const url = `${TMDB_BASE_URL}/movie/${tmdbId}/external_ids?api_key=${env.TMDB_API_KEY}`;
        const res = await fetch(url, { next: { revalidate: 86400 } });

        if (!res.ok) {
            console.error(`TMDb API Error: ${res.status}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching external IDs:", error);
        return null;
    }
}
