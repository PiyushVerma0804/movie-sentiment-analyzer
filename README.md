# Movie Sentiment Dashboard

An AI-powered movie sentiment analysis application built with Next.js (App Router), Tailwind CSS, TMDb API, and OpenAI.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- API Keys for TMDb and OpenAI

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment variables file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   **Required Environment Variables:**
   - `TMDB_API_KEY`: Your The Movie Database v3 API key.
   - `OPENAI_API_KEY`: Your OpenAI API key.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Deployment (Vercel)

This application is fully optimized for Vercel's Serverless environment.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Go to [Vercel](https://vercel.com/) and import the repository.
3. Configure the following **Environment Variables** securely in the Vercel project settings:
   - `TMDB_API_KEY`
   - `OPENAI_API_KEY`
4. Deploy the project. Vercel will automatically use `npm run build` to statically generate/compile the project.

### Testing Production Locally

To verify the production build behaves correctly on your local machine:

```bash
# Build the production optimized bundle
npm run build

# Start the production server
npm run start
```

## Architecture & Edge Compatibility
- **API Routes**: Prepared for serverless environment execution. Uses fast native `fetch` mappings.
- **Error Handling**: Follows secure practices (does not leak stack traces to the client in production).
- **Caching**: Abstracted memory caching ensures no memory leaks during serverless cold starts. For persistent edge caching, consider dropping in Vercel KV into `lib/infrastructure/cache.js`.
