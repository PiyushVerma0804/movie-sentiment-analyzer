# AI Movie Sentiment Analyzer

A modern, fast, and intelligent Movie Sentiment Analysis web application built with **Next.js 14 (App Router)** and **Tailwind CSS**. It leverages the TMDB API for movie discovery and data, and uses Google Gemini 2.5 AI for complex sentiment aggregation from audience reviews.

## Features
- **Intelligent Search:** Quick find movies by title using TMDB search capabilities.
- **Audience Sentiment Extraction:** Uses Gemini AI to parse through raw community movie reviews, generating a reliable aggregate positive/negative spread.
- **Content Themes:** Automatically surfaces recurring themes and critical feedback snippets.
- **Robust Cacheing Setup:** An integrated in-memory caching system supports deduplication and TTL guards to drastically lower external API hits.

---

## Code Architecture
The repository adheres to a clean architecture pattern making it extremely intuitive for developers to jump in.

- `/app`: Next.js App Router UI pages and Backend API routes (`/api/analyze/route.js`).
- `/components`: Self-contained, pure React UI presentation components (e.g. `SentimentCard`, `MovieSearch`).
- `/services`: External API communication adapters (`aiService.js`, `tmdbService.js`).
- `/utils`: Pure functional utilities heavily aimed at string formatting and AI payload extraction.
- `/lib`: Global infrastructure integrations, particularly caching and rate limiting singletons.

---

## 🚀 Setup Instructions

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository_url>
   cd movie-sentiment-analyzer
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables:**
   Rename \`.env.example\` to \`.env.local\` and populate your secret keys:
   \`\`\`env
   TMDB_API_KEY="your_tmdb_api_key_v3_here"
   GEMINI_API_KEY="your_gemini_api_key_here"
   \`\`\`

## 💻 Running Locally

Start the local development server:
\`\`\`bash
npm run dev
\`\`\`
The application will be running at \`http://localhost:3000\`.

## 📦 Deployment Instructions

The application is fully configured for zero-setup deployment via **Vercel** or any cloud provider supporting standard Next.js deployments.

1. Connect your repository to Vercel.
2. Under deployment settings, set your Environment Variables:
   - \`TMDB_API_KEY\`
   - \`GEMINI_API_KEY\`
3. Deploy! Next.js will automatically static-generate and deploy the API routes serverlessly.

*Note: For a fully scaled production runtime, standard implementation dictates converting \`lib/cache.js\` into a persistent Redis or Vercel KV store so rate limit blocks persist across lambda deployments.*
