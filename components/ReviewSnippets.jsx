/**
 * @file ReviewSnippets.jsx
 * @description Component to display representative audience reviews used in sentiment analysis.
 */

export default function ReviewSnippets({ reviewSnippets }) {
    const positiveReview = reviewSnippets?.positive;
    const negativeReview = reviewSnippets?.negative;

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Representative Reviews</h3>
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-800">
                {/* Positive Review */}
                {positiveReview && (
                    <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">Top Positive Review</h4>
                        <div className="border-l-4 border-green-500 pl-4 text-gray-300 italic">
                            "{positiveReview}"
                        </div>
                    </div>
                )}

                {/* Negative Review */}
                {negativeReview && (
                    <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-2">Top Critical Review</h4>
                        <div className="border-l-4 border-red-500 pl-4 text-gray-300 italic">
                            "{negativeReview}"
                        </div>
                    </div>
                )}

                {/* Fallback if no reviews */}
                {!positiveReview && !negativeReview && (
                    <p className="text-gray-500 italic text-center py-4">
                        No representative review snippet available.
                    </p>
                )}
            </div>
        </div>
    );
}
