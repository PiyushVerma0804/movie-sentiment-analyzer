/**
 * @file layout.js
 * @description Next.js App Router root layout.
 * Wraps all pages with HTML and body tags, global styles, and shared UI (if any).
 */

import './globals.css';

export const metadata = {
    title: 'Movie Sentiment Analyzer',
    description: 'AI-powered movie sentiment analysis tool',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <main>{children}</main>
            </body>
        </html>
    );
}
