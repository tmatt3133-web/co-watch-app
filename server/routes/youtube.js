import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.use(authenticateToken);

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');

  return hours * 3600 + minutes * 60 + seconds;
};

router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ message: 'YouTube API not configured' });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
    );

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = response.data.items[0];
    const videoInfo = {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
      duration: parseDuration(video.contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${video.id}`,
    };

    res.json({ videoInfo });
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ message: 'Failed to fetch video information' });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.body;

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ message: 'YouTube API not configured' });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=${maxResults}`
    );

    const videos = response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({ videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ message: 'Failed to search videos' });
  }
});

export default router;