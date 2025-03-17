import React from 'react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const VideoCard = ({ video, isSelected, onSelect, onAnalytics }) => {
  const handleCardClick = (e) => {
    // If the checkbox was clicked, don't trigger the analytics view
    if (e.target.type === 'checkbox') return;
    onAnalytics();
  };

  return (
    <div 
      className={`video-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      <img 
        src={video.thumbnailUrl} 
        alt={video.title} 
        className="video-thumbnail"
      />
      <div className="video-info">
        <div className="video-title">{video.title}</div>
        <div className="video-channel">{video.channelTitle}</div>
        <div className="video-stats">
          <div className="video-stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            {formatNumber(video.viewCount)}
          </div>
          <div className="video-stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
            </svg>
            {formatNumber(video.likeCount)}
          </div>
          <div className="video-stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            {formatNumber(video.commentCount)}
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            {' '}Select for comparison
          </label>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
