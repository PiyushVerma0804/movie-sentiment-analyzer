/**
 * @file ThemeChips.jsx
 * @description Reusable UI component displaying extracted themes or keywords as chips/tags.
 */

export default function ThemeChips({ themes }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Audience Themes</h3>
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-800">
                {/* Positive Themes */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Positive Themes</h4>
                    {themes?.positive && themes.positive.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {themes.positive.map((theme, index) => (
                                <span
                                    key={`positive-${index}`}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:scale-105 transition duration-300"
                                >
                                    {theme}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No positive themes detected.</p>
                    )}
                </div>

                {/* Negative Themes */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Negative Themes</h4>
                    {themes?.negative && themes.negative.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {themes.negative.map((theme, index) => (
                                <span
                                    key={`negative-${index}`}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:scale-105 transition duration-300"
                                >
                                    {theme}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No negative themes detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
