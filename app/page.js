/**
 * @file page.js
 * @description Next.js App Router root page.
 * The main landing page for the movie sentiment analysis tool.
 * Manages the state and data flow to the /api/analyze endpoint.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MovieHeader from '@/components/MovieHeader';
import SentimentCard from '@/components/SentimentCard';
import ThemeChips from '@/components/ThemeChips';
import ReviewSnippets from '@/components/ReviewSnippets';
import MovieSearch from '@/components/MovieSearch';
import AnalysisProgress from '@/components/AnalysisProgress';

export default function HomePage() {
    const [imdbId, setImdbId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [movieData, setMovieData] = useState(null);
    const [validationError, setValidationError] = useState(null);

    // Validate IMDb ID format
    const validateImdbFormat = (id) => {
        const imdbPattern = /^tt\d{7,8}$/;
        return imdbPattern.test(id);
    };

    const handleAnalyze = async (idToAnalyze) => {
        const id = typeof idToAnalyze === 'string' ? idToAnalyze : imdbId;

        if (!id?.trim()) return;

        // Validate format before sending request
        if (!validateImdbFormat(id)) {
            setValidationError('Invalid IMDb ID format. Please use format: tt1234567');
            return;
        }

        setLoading(true);
        setError(null);
        setValidationError(null);
        setMovieData(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imdbId: id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unexpected error occurred.');
            }

            setMovieData(data);
        } catch (err) {
            let errorMessage = err.message;

            // Provide more user-friendly error messages if not already provided by API
            if (errorMessage.includes('Movie not found')) {
                errorMessage = '❌ Movie not found\nPlease enter a valid IMDb ID like: tt0133093';
            } else if (errorMessage.includes('Invalid IMDb ID format')) {
                errorMessage = '❌ Invalid IMDb ID format\nPlease use format: tt1234567';
            } else if (errorMessage.includes('Rate limit exceeded')) {
                errorMessage = '⏱️ Too many requests\nPlease wait a moment and try again';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            duration={0.6}
        >
            {/* Hero Section */}
            {!movieData && !loading && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        duration={0.8}
                    >
                        Discover What Audiences Really Think About Movies
                    </motion.h1>

                    <motion.p
                        className="text-gray-400 max-w-xl text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        duration={0.8}
                        delay={0.1}
                    >
                        Analyze thousands of movie reviews using AI-powered sentiment analysis.
                    </motion.p>

                    <motion.form
                        className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-md relative z-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        duration={0.8}
                        delay={0.2}
                        onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
                    >
                        <MovieSearch
                            imdbId={imdbId}
                            setImdbId={setImdbId}
                            onAnalyze={handleAnalyze}
                            disabled={loading}
                            validationError={validationError}
                            setValidationError={setValidationError}
                        />
                        <button
                            type="submit"
                            disabled={loading || !imdbId.trim() || !!validationError}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Movie'}
                        </button>
                    </motion.form>

                    {/* Validation Error */}
                    {validationError && (
                        <motion.div
                            className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            duration={0.3}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-400">Invalid IMDb ID</h3>
                                    <p className="mt-1 text-sm text-red-300">{validationError}</p>
                                    <p className="mt-2 text-sm text-red-400">Example: tt0133093 (The Matrix)</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Results Section */}
            {(movieData || loading || error) && (
                <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
                    {/* Back to Search Button */}
                    {movieData && !loading && !error && (
                        <motion.button
                            onClick={() => {
                                setMovieData(null);
                                setImdbId('');
                                setError(null);
                                setValidationError(null);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            duration={0.5}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Analyze another movie
                        </motion.button>
                    )}

                    {/* Error State */}
                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            duration={0.5}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">Error</h3>
                                    <div className="mt-1 text-sm whitespace-pre-line">{error}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {loading && <AnalysisProgress />}

                    {/* Success State - Display Components */}
                    {movieData && !loading && (
                        <motion.div
                            className="space-y-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            duration={0.6}
                        >
                            {/* Movie Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                duration={0.8}
                                className="bg-gray-900 rounded-2xl shadow-xl p-6"
                            >
                                <MovieHeader
                                    title={movieData.movie.title}
                                    poster={movieData.movie.poster}
                                    releaseDate={movieData.movie.releaseDate}
                                    rating={movieData.movie.rating}
                                    cast={movieData.movie.cast}
                                    director={movieData.movie.director}
                                    plot={movieData.movie.plot}
                                />
                            </motion.div>

                            {/* Sentiment Analysis */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                duration={0.8}
                                delay={0.15}
                            >
                                <SentimentCard sentiment={movieData.sentiment} />
                            </motion.div>

                            {/* Review Snippets */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                duration={0.8}
                                delay={0.3}
                            >
                                <ReviewSnippets
                                    reviewSnippets={movieData.reviewSnippets}
                                />
                            </motion.div>

                            {/* Theme Chips */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                duration={0.8}
                                delay={0.45}
                            >
                                <ThemeChips themes={movieData.themes} />
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
