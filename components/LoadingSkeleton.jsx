/**
 * @file LoadingSkeleton.jsx
 * @description Reusable UI component showing a loading state (skeleton screen) 
 * while analysis is in progress.
 */

export default function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            {/* Movie Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
                {/* Poster Skeleton */}
                <div className="w-40 h-60 bg-gray-800 rounded-xl animate-pulse" />
                
                {/* Details Skeleton */}
                <div className="flex-1 space-y-4">
                    {/* Title Skeleton */}
                    <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse" />
                    
                    {/* Rating Skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-24 animate-pulse" />
                    </div>
                    
                    {/* Director Skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-20 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-40 animate-pulse" />
                    </div>
                    
                    {/* Cast Skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-16 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-60 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Sentiment Card Skeleton */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                {/* Title Skeleton */}
                <div className="h-6 bg-gray-800 rounded w-40 mb-4 animate-pulse" />
                
                {/* Sentiment Badge Skeleton */}
                <div className="h-8 bg-gray-800 rounded-full w-32 mb-6 animate-pulse" />
                
                {/* Chart Skeleton */}
                <div className="flex justify-center mb-6">
                    <div className="w-64 h-64 bg-gray-800 rounded-full animate-pulse" />
                </div>
                
                {/* Progress Bars Skeleton */}
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-4 bg-gray-800 rounded w-24 animate-pulse" />
                            <div className="h-4 bg-gray-800 rounded w-12 animate-pulse" />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div className="h-3 bg-gray-600 rounded-full w-3/4 animate-pulse" />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-4 bg-gray-800 rounded w-24 animate-pulse" />
                            <div className="h-4 bg-gray-800 rounded w-12 animate-pulse" />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div className="h-3 bg-gray-600 rounded-full w-1/4 animate-pulse" />
                        </div>
                    </div>
                </div>
                
                {/* Summary Skeleton */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-20 mb-2 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-full animate-pulse" />
                        <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse" />
                        <div className="h-3 bg-gray-700 rounded w-4/6 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Review Snippets Skeleton */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                <div className="h-6 bg-gray-800 rounded w-40 mb-4 animate-pulse" />
                <div className="space-y-4">
                    <div className="border-l-4 border-gray-700 pl-4">
                        <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse mt-2" />
                    </div>
                    <div className="border-l-4 border-gray-700 pl-4">
                        <div className="h-4 bg-gray-800 rounded w-4/5 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse mt-2" />
                    </div>
                </div>
            </div>

            {/* Theme Chips Skeleton */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                <div className="h-6 bg-gray-800 rounded w-40 mb-4 animate-pulse" />
                
                {/* Positive Themes Skeleton */}
                <div className="mb-6">
                    <div className="h-4 bg-gray-800 rounded w-28 mb-3 animate-pulse" />
                    <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-gray-800 rounded-full w-20 animate-pulse" />
                        <div className="h-6 bg-gray-800 rounded-full w-24 animate-pulse" />
                        <div className="h-6 bg-gray-800 rounded-full w-16 animate-pulse" />
                    </div>
                </div>
                
                {/* Negative Themes Skeleton */}
                <div>
                    <div className="h-4 bg-gray-800 rounded w-28 mb-3 animate-pulse" />
                    <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-gray-800 rounded-full w-20 animate-pulse" />
                        <div className="h-6 bg-gray-800 rounded-full w-28 animate-pulse" />
                        <div className="h-6 bg-gray-800 rounded-full w-18 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
