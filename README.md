# Brand Social Feed

A social media aggregator that displays Instagram posts from various brands in a responsive grid layout. 

## Features

- Automatically fetches posts from Instagram using Apify
- Displays posts in a responsive grid layout
- Allows filtering by brand
- Hourly refresh via Apify scheduled tasks
- Manual refresh capability

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Apify for Instagram data

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the following variables:
   ```
   APIFY_API_TOKEN=your_apify_token
   APIFY_TASK_ID=your_apify_task_id
   WEBHOOK_SECRET=your_webhook_secret
   ```
4. Run the development server: `npm run dev`

## Deployment

This project is deployed on Vercel. The Apify task is scheduled to run hourly, and the data is refreshed automatically.

## Branching Strategy

- `main` - Production branch
- `develop` - Development branch 