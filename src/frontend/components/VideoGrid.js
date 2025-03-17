import React from 'react';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, selectedVideos, onVideoSelect, onVideoAnalytics }) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="card">
        <p>No videos found. Try searching for YouTube videos above.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Search Results</h2>
        <p>Select videos to compare or click on a video to view detailed analytics.</p>
        {selectedVideos.length > 0 && (
          <p>
            <strong>{selectedVideos.length} videos selected for comparison.</strong>
          </p>
        )}
      </div>
      
      <div className="video-grid">
        {videos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isSelected={selectedVideos.some(v => v.id === video.id)}
            onSelect={() => onVideoSelect(video)}
            onAnalytics={() => onVideoAnalytics(video)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
