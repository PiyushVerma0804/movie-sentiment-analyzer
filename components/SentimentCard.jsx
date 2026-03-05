/**
 * @file SentimentCard.jsx
 * @description Reusable UI component to display the final sentiment analysis results.
 * Shows scores, summary, and visual indicators.
 */

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function SentimentCard({ sentiment }) {
    if (!sentiment) return null;

    const getSentimentColor = (overall) => {
        switch (overall) {
            case 'positive':
                return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-green-500/20';
            case 'negative':
                return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20';
            case 'mixed':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getProgressBarColor = (type) => {
        return type === 'positive' ? 'bg-green-500' : 'bg-red-500';
    };

    const sentimentColor = getSentimentColor(sentiment.overall);

    // Chart data for pie visualization
    const chartData = [
        { name: "Positive", value: sentiment.positivePercent ?? 75 },
        { name: "Negative", value: sentiment.negativePercent ?? 25 }
    ];

    // Custom colors for pie slices
    const COLORS = {
        Positive: '#22c55e',
        Negative: '#ef4444'
    };

    return (
        <div>
            {/* Section Title */}
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Audience Sentiment Analysis</h3>

            {/* Card Container */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-800">
                {/* Sentiment Classification */}
                <div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-semibold ${sentimentColor} shadow-lg`}>
                        <span className="capitalize">{sentiment.overall}</span>
                    </div>
                </div>

                {/* Pie Chart Visualization */}
                <div className="flex justify-center">
                    <div className="hover:scale-105 transition duration-300 bg-gray-800 rounded-lg p-4 w-full max-w-md">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#d1d5db' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                    {/* Positive Progress Bar */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">Positive Reviews</span>
                            <span className="text-sm font-bold text-green-400">{sentiment.positivePercent}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                                className={`${getProgressBarColor('positive')} h-3 rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${sentiment.positivePercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Negative Progress Bar */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">Negative Reviews</span>
                            <span className="text-sm font-bold text-red-400">{sentiment.negativePercent}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                                className={`${getProgressBarColor('negative')} h-3 rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${sentiment.negativePercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">AI Summary</h4>
                    <p className="text-gray-300 leading-relaxed">{sentiment.summary}</p>
                </div>
            </div>
        </div>
    );
}
