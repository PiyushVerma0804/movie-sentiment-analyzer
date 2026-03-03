/**
 * @file page.js
 * @description Next.js App Router root page.
 * The main landing page for the movie sentiment analysis tool.
 * Manages the state and data flow to the /api/analyze endpoint.
 */

'use client';

import { useState } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function HomePage() {
    const [imdbId, setImdbId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [movieData, setMovieData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imdbId.trim()) return;

        setLoading(true);
        setError(null);
        setMovieData(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imdbId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unexpected error occurred.');
            }

            setMovieData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Movie Sentiment Analyzer</h1>
            <p>Enter an IMDb ID (e.g., tt0111161) to analyze its review sentiments using AI.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <input
                    type="text"
                    value={imdbId}
                    onChange={(e) => setImdbId(e.target.value)}
                    placeholder="e.g. tt1234567"
                    disabled={loading}
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                    required
                />
                <button
                    type="submit"
                    disabled={loading || !imdbId.trim()}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {error && (
                <div style={{ color: 'red', marginTop: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#fff0f0' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading && <LoadingSkeleton />}

            {movieData && !loading && (
                <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', overflowX: 'auto' }}>
                    <h2>Analysis Results</h2>
                    <p style={{ color: 'gray', fontSize: '14px' }}>
                        Note: This is the raw JSON response. UI Components will be implemented later.
                    </p>
                    <pre style={{ backgroundColor: '#eeeeee', padding: '15px', borderRadius: '4px' }}>
                        {JSON.stringify(movieData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
