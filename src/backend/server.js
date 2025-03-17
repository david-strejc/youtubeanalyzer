const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.YOUTUBE_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// API Routes

// Get video details
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(response.data.items[0]);
  } catch (error) {
    console.error('Error fetching video details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get video comments
app.get('/api/video/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { maxResults = 20 } = req.query;
    
    const response = await youtube.commentThreads.list({
      part: 'snippet',
      videoId: id,
      maxResults
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get video statistics over time (simulated data as YouTube API doesn't provide historical data)
app.get('/api/video/:id/stats/history', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current stats
    const response = await youtube.videos.list({
      part: 'statistics',
      id
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const currentStats = response.data.items[0].statistics;
    
    // Generate simulated historical data (last 30 days)
    const historicalData = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate decreasing numbers as we go back in time
      const factor = (30 - i) / 30;
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(currentStats.viewCount * factor),
        likes: Math.floor(currentStats.likeCount * factor),
        comments: Math.floor(currentStats.commentCount * factor)
      });
    }

    res.json(historicalData);
  } catch (error) {
    console.error('Error generating historical stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Compare multiple videos
app.post('/api/videos/compare', async (req, res) => {
  try {
    const { videoIds } = req.body;
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ message: 'Video IDs array is required' });
    }

    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds.join(',')
    });

    const videos = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      viewCount: parseInt(item.statistics.viewCount, 10),
      likeCount: parseInt(item.statistics.likeCount, 10),
      commentCount: parseInt(item.statistics.commentCount, 10),
      // Calculate engagement rate (likes + comments) / views * 100
      engagementRate: ((parseInt(item.statistics.likeCount, 10) + 
                        parseInt(item.statistics.commentCount, 10)) / 
                        parseInt(item.statistics.viewCount, 10) * 100).toFixed(2)
    }));

    res.json(videos);
  } catch (error) {
    console.error('Error comparing videos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to extract channel username from URL
const extractChannelUsername = (query) => {
  // Check if the query is a YouTube channel URL
  const channelUrlRegex = /youtube\.com\/@([a-zA-Z0-9_-]+)/;
  const match = query.match(channelUrlRegex);
  
  if (match && match[1]) {
    return match[1]; // Return the username part
  }
  
  // Check if it's just a username with @ prefix
  if (query.startsWith('@')) {
    return query.substring(1); // Remove the @ and return the username
  }
  
  return null; // Not a channel URL or username
};

// Search videos
app.get('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;
    console.log('Search request received:', { query, maxResults });
    
    if (!query) {
      console.log('No query provided');
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Check if this is a channel search
    const channelUsername = extractChannelUsername(query);
    let response;
    
    if (channelUsername) {
      console.log('Detected channel search for username:', channelUsername);
      
      // First, get the channel ID from the username
      const channelResponse = await youtube.channels.list({
        part: 'id',
        forUsername: channelUsername
      });
      
      let channelId;
      
      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
        // Found channel by username
        channelId = channelResponse.data.items[0].id;
      } else {
        // If not found by username, try searching for the channel
        console.log('Channel not found by username, trying search...');
        const channelSearchResponse = await youtube.search.list({
          part: 'snippet',
          q: channelUsername,
          type: 'channel',
          maxResults: 1
        });
        
        if (channelSearchResponse.data.items && channelSearchResponse.data.items.length > 0) {
          channelId = channelSearchResponse.data.items[0].id.channelId;
        } else {
          console.log('Channel not found:', channelUsername);
          return res.status(404).json({ message: 'Channel not found' });
        }
      }
      
      console.log('Found channel ID:', channelId);
      
      // Now get videos from this channel
      response = await youtube.search.list({
        part: 'snippet',
        channelId: channelId,
        type: 'video',
        order: 'date', // Get most recent videos
        maxResults: parseInt(maxResults, 10)
      });
      
      console.log('Found', response.data.items?.length || 0, 'videos from channel');
    } else if (query === 'trending') {
      // Special case for initial load - if query is 'trending', get trending videos
      console.log('Fetching trending videos');
      response = await youtube.search.list({
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: parseInt(maxResults, 10)
      });
    } else {
      // Regular search query
      console.log('Searching YouTube with query:', query);
      response = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: parseInt(maxResults, 10)
      });
    }
    console.log('YouTube search response received with', response.data.items?.length || 0, 'items');

    if (!response.data.items || response.data.items.length === 0) {
      console.log('No videos found');
      return res.json([]);
    }

    const videoIds = response.data.items.map(item => 
      item.id.videoId || item.id
    ).filter(id => id);
    
    console.log('Video IDs found:', videoIds);
    
    if (videoIds.length === 0) {
      return res.json([]);
    }
    
    // Get additional statistics for the videos
    console.log('Fetching video statistics');
    const videosResponse = await youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds.join(',')
    });
    console.log('Statistics received for', videosResponse.data.items?.length || 0, 'videos');

    // Combine search results with statistics
    const videos = videosResponse.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      likeCount: parseInt(item.statistics.likeCount, 10) || 0,
      commentCount: parseInt(item.statistics.commentCount, 10) || 0
    }));

    console.log('Sending response with', videos.length, 'videos');
    
    // Send the JSON response directly
    res.json(videos);
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Analysis of video
app.get('/api/video/:id/ai-analysis', async (req, res) => {
  try {
    console.log('AI analysis request received for video ID:', req.params.id);
    const { id } = req.params;
    const { analysisType = 'general' } = req.query;
    
    // Get video details
    console.log('Fetching video details...');
    const response = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.log('Video not found:', id);
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = response.data.items[0];
    console.log('Video details retrieved for:', video.snippet.title);
    
    // Get comments for additional context
    console.log('Fetching video comments...');
    let comments = [];
    let commentTexts = '';
    
    try {
      const commentsResponse = await youtube.commentThreads.list({
        part: 'snippet',
        videoId: id,
        maxResults: 10
      });
      
      comments = commentsResponse.data.items || [];
      commentTexts = comments.map(comment => 
        comment.snippet.topLevelComment.snippet.textDisplay
      ).join('\n\n');
      
      console.log('Retrieved', comments.length, 'comments');
    } catch (commentError) {
      // Comments might be disabled for the video, continue without comments
      console.log('Could not retrieve comments, possibly disabled:', commentError.message);
    }
    
    // Prepare prompt for Gemini based on analysis type
    console.log('Preparing prompt for analysis type:', analysisType);
    let prompt = '';
    
    switch (analysisType) {
      case 'content':
        prompt = `Analyze the content of this YouTube video based on its metadata:
        
Title: ${video.snippet.title}
Description: ${video.snippet.description}
Channel: ${video.snippet.channelTitle}
Published: ${video.snippet.publishedAt}
Views: ${video.statistics.viewCount}
Likes: ${video.statistics.likeCount}
Comments: ${video.statistics.commentCount}

Sample comments:
${commentTexts}

Provide a detailed content analysis including:
1. Main topics and themes
2. Target audience
3. Content quality assessment
4. Potential content improvements
5. SEO recommendations`;
        break;
        
      case 'engagement':
        prompt = `Analyze the engagement metrics of this YouTube video:
        
Title: ${video.snippet.title}
Channel: ${video.snippet.channelTitle}
Views: ${video.statistics.viewCount}
Likes: ${video.statistics.likeCount}
Comments: ${video.statistics.commentCount}
Engagement Rate: ${((parseInt(video.statistics.likeCount || 0) + parseInt(video.statistics.commentCount || 0)) / parseInt(video.statistics.viewCount || 1) * 100).toFixed(2)}%

Provide an engagement analysis including:
1. Engagement rate assessment compared to typical YouTube videos
2. Factors that might be affecting engagement
3. Recommendations to improve engagement
4. Audience retention strategies
5. Call-to-action effectiveness`;
        break;
        
      case 'growth':
        prompt = `Analyze the growth potential of this YouTube video:
        
Title: ${video.snippet.title}
Description: ${video.snippet.description}
Channel: ${video.snippet.channelTitle}
Published: ${video.snippet.publishedAt}
Views: ${video.statistics.viewCount}
Likes: ${video.statistics.likeCount}
Comments: ${video.statistics.commentCount}

Provide a growth potential analysis including:
1. Viral potential assessment
2. Recommendations for increasing reach
3. Cross-platform promotion strategies
4. Collaboration opportunities
5. Content series potential`;
        break;
        
      default: // general analysis
        prompt = `Analyze this YouTube video based on its metadata:
        
Title: ${video.snippet.title}
Description: ${video.snippet.description}
Channel: ${video.snippet.channelTitle}
Published: ${video.snippet.publishedAt}
Views: ${video.statistics.viewCount}
Likes: ${video.statistics.likeCount}
Comments: ${video.statistics.commentCount}

Sample comments:
${commentTexts}

Provide a comprehensive analysis including:
1. Content summary and quality assessment
2. Audience and engagement analysis
3. Performance evaluation compared to similar videos
4. Strengths and weaknesses
5. Recommendations for improvement`;
    }
    
    // Generate AI analysis using Gemini
    console.log('Generating AI analysis with Gemini...');
    try {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await geminiModel.generateContent(prompt);
      const response_text = result.response.text();
      
      console.log('AI analysis generated successfully');
      
      res.json({
        videoId: id,
        analysisType,
        analysis: response_text
      });
    } catch (aiError) {
      console.error('Error with Gemini AI:', aiError);
      // Check if it's a specific Gemini error
      if (aiError.message && aiError.message.includes('API key')) {
        return res.status(500).json({ 
          message: 'AI API key error', 
          error: 'The API key for Gemini AI is invalid or has insufficient permissions.'
        });
      }
      throw aiError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI analysis', 
      error: error.message 
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
