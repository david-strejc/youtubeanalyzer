# YouTube Video Analyzer

A web application for analyzing YouTube videos, comparing metrics, and visualizing trends with AI-powered insights.

## Features

- Search for YouTube videos
- View detailed analytics for individual videos
- Compare multiple videos with interactive charts
- Analyze video performance trends over time
- View and analyze video comments
- AI-powered video analysis using Google Gemini
- Featured channel: [@davidstrejc](https://www.youtube.com/@davidstrejc)

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Chart.js
- **APIs**: YouTube Data API v3, Google Gemini AI
- **Data Visualization**: Chart.js

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- YouTube Data API key

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd youtubeanalyzer
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory and add your YouTube API key:
```
PORT=5000
YOUTUBE_API_KEY=your_youtube_api_key_here
NODE_ENV=development
```

## Running the Application

### Development Mode

To run both the backend server and frontend development server concurrently:

```
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Production Build

To create a production build:

```
npm run build
```

To run the production build:

```
npm start
```

## API Endpoints

- `GET /api/video/:id` - Get video details
- `GET /api/video/:id/comments` - Get video comments
- `GET /api/video/:id/stats/history` - Get video statistics history
- `GET /api/video/:id/ai-analysis` - Get AI-powered analysis of video content
- `POST /api/videos/compare` - Compare multiple videos
- `GET /api/search` - Search for videos

## Usage

1. Enter a search term in the search bar to find YouTube videos
2. Click on a video card to view detailed analytics
3. Check the checkbox on multiple videos to select them for comparison
4. Click on the "Compare" tab to see a comparison of the selected videos
5. In the video analytics view, click on the "AI Analysis" tab to get AI-powered insights about the video content, engagement, and growth potential

## License

MIT
