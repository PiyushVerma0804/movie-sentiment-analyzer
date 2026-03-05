'use client';

import { useState, useEffect, useRef } from 'react';
import { searchMovies, getMovieExternalIds } from '@/app/actions/tmdb';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieSearch({ imdbId, setImdbId, onAnalyze, disabled, validationError, setValidationError }) {
    const [query, setQuery] = useState(imdbId || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    // Sync query with imdbId if it changes externally
    useEffect(() => {
        setQuery(imdbId || '');
    }, [imdbId]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setImdbId(value); // Keep parent state synced

        if (validationError) {
            setValidationError(null);
        }

        // If it looks like an IMDb ID, just let them submit it normally, close dropdown
        // e.g., 'tt1234567'
        if (/^tt\d+$/.test(value)) {
            setIsOpen(false);
            return;
        }

        if (value.trim().length === 0) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        setIsSearching(true);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await searchMovies(value);
                setSuggestions(results);
            } catch (err) {
                console.error("Search error", err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectMovie = async (movie) => {
        // Optimistic UI update
        setQuery(movie.title);
        setIsOpen(false);
        setIsSearching(true);
        // We set disabled state manually on the parent if possible, or visually here

        try {
            const externalIds = await getMovieExternalIds(movie.id);
            if (externalIds && externalIds.imdb_id) {
                const selectedImdbId = externalIds.imdb_id;
                setImdbId(selectedImdbId);
                // Trigger analysis automatically
                onAnalyze(selectedImdbId);
            } else {
                setValidationError("This movie doesn't have an associated IMDb ID.");
            }
        } catch (error) {
            setValidationError("Failed to get IMDb ID for the selected movie.");
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative w-full sm:w-72" ref={dropdownRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                    if (query.trim() && !/^tt\d+$/.test(query)) {
                        setIsOpen(true);
                    }
                }}
                placeholder="Search movie title or enter IMDb ID..."
                disabled={disabled}
                className={`border rounded-lg px-4 py-3 w-full bg-gray-800 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-700 disabled:cursor-not-allowed placeholder-gray-500 transition-colors ${validationError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700'
                    }`}
                required
            />

            <AnimatePresence>
                {isOpen && query.trim() && !/^tt\d+$/.test(query) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-full bg-gray-900 rounded-xl shadow-lg border border-gray-700 max-h-80 overflow-y-auto z-50 text-left"
                    >
                        {isSearching ? (
                            <div className="p-4 text-gray-400 text-sm flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="p-4 text-gray-400 text-sm text-center">
                                No movies found
                            </div>
                        ) : (
                            <div className="py-2">
                                {suggestions.map(movie => (
                                    <div
                                        key={movie.id}
                                        onClick={() => handleSelectMovie(movie)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-14 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-100 truncate">
                                                {movie.title}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
