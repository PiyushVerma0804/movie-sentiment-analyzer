'use client';

import { useState, useEffect } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import { motion } from 'framer-motion';

export default function AnalysisProgress() {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Fetching movie data...");

    useEffect(() => {
        // Simulate progress based on time
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 1;

            // Map progress to messages
            if (currentProgress < 20) {
                setMessage("Fetching movie data...");
            } else if (currentProgress < 50) {
                setMessage("Analyzing audience reviews...");
            } else if (currentProgress < 80) {
                setMessage("Generating AI sentiment insights...");
            } else {
                setMessage("Finalizing report...");
                // Slow down dramatically after 95% so it doesn't quite hit 100% until response
                if (currentProgress > 95) {
                    currentProgress = 95;
                }
            }

            setProgress(currentProgress);
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 w-full">
            {/* Progress Container */}
            <div className="space-y-2">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-end"
                >
                    <span className="text-gray-400 text-sm font-medium transition-all duration-300">
                        {message}
                    </span>
                    <span className="text-gray-500 text-xs font-mono">{progress}%</span>
                </motion.div>

                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700 shadow-inner">
                    <motion.div
                        className="bg-blue-500 h-2 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Skeleton Loader */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <LoadingSkeleton />
            </motion.div>
        </div>
    );
}
