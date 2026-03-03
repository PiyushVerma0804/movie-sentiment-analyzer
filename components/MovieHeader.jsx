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
    director
}) {
    if (!title) return null;

    const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';
    const posterUrl = poster
        ? `https://image.tmdb.org/t/p/w500${poster}`
        : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

    const topCast = cast.slice(0, 5).map(member => member.name).join(', ');

    return (
        <header className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-xl shadow-sm mb-6">
            {/* Poster */}
            <img
                src={posterUrl}
                alt={`Poster for ${title}`}
                className="w-full md:w-48 xl:w-56 h-auto object-cover rounded-lg shadow-md"
            />

            {/* Details */}
            <div className="flex-1 flex flex-col justify-center">
                {/* Title & Year */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {title} {releaseYear && <span className="text-gray-500 font-normal">({releaseYear})</span>}
                </h2>

                {/* Metadata section */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    {/* Rating Badge */}
                    {rating > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-teal-400 font-bold border-2 border-slate-700 shadow-inner">
                                {Number(rating).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">User Score</span>
                        </div>
                    )}
                </div>

                {/* Credits */}
                <div className="space-y-3 mt-2">
                    {director && (
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900 block md:inline mr-2">Director:</span>
                            <span className="text-gray-700">{director}</span>
                        </div>
                    )}

                    {topCast && (
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900 block md:inline mr-2">Top Cast:</span>
                            <span className="text-gray-700 leading-relaxed">{topCast}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
