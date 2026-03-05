/**
 * @file MovieHeader.jsx
 * @description Reusable UI component to display movie metadata (title, poster, release year).
 * Uses Tailwind CSS for all styling.
 */

export default function MovieHeader({
    title,
    poster,
    releaseDate,
    rating,
    cast = [],
    director,
    plot
}) {
    if (!title) return null;

    const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';
    const posterUrl = poster
        ? `https://image.tmdb.org/t/p/w500${poster}`
        : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

    const topCast = cast.slice(0, 5).map(member => member.name).join(', ');

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left Column - Poster */}
            <img
                src={posterUrl}
                alt={`Poster for ${title}`}
                className="w-40 rounded-xl shadow-lg hover:scale-105 transition duration-300 object-cover"
            />

            {/* Right Column - Movie Information */}
            <div className="flex-1">
                {/* Movie Title and Year */}
                <h2 className="text-3xl font-bold text-white mb-2">
                    {title} {releaseYear && <span className="text-gray-400">({releaseYear})</span>}
                </h2>

                {/* IMDb Rating */}
                {rating > 0 && (
                    <div className="text-gray-400 mt-1">
                        <span className="text-yellow-500 font-semibold">⭐ {rating} / 10</span>
                    </div>
                )}

                {/* Director */}
                {director && (
                    <div className="text-gray-400 mt-3">
                        <span className="font-medium text-gray-300">Director:</span> {director}
                    </div>
                )}

                {/* Cast */}
                {topCast && (
                    <div className="text-gray-400 mt-1">
                        <span className="font-medium text-gray-300">Cast:</span> {topCast}
                    </div>
                )}

                {/* Plot Summary */}
                {plot && (
                    <div className="border-t border-gray-700 pt-3 mt-4">
                        <div className="text-sm font-medium text-gray-300 mb-2">Plot Summary</div>
                        <p className="text-gray-300 leading-relaxed">{plot}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
