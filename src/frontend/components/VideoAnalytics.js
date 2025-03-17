import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import AIAnalysis from './AIAnalysis';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VideoAnalytics = ({ video, onBack }) => {
  const [videoDetails, setVideoDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!video) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch video details
        const detailsResponse = await fetch(`/api/video/${video.id}`);
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch video details');
        }
        
        const detailsData = await detailsResponse.json();
        setVideoDetails(detailsData);
        
        // Fetch comments
        const commentsResponse = await fetch(`/api/video/${video.id}/comments`);
        
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch video comments');
        }
        
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
        
        // Fetch historical data
        const historyResponse = await fetch(`/api/video/${video.id}/stats/history`);
        
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const historyData = await historyResponse.json();
        setHistoricalData(historyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [video]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button className="button" onClick={onBack}>
          Back to Search
        </button>
      </div>
    );
  }

  if (!video || !videoDetails) {
    return (
      <div className="card">
        <p>No video selected for analysis.</p>
        <button className="button" onClick={onBack}>
          Back to Search
        </button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    
    // PT1H23M45S format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) return duration;
    
    const hours = match[1] ? `${match[1]}:` : '';
    const minutes = match[2] ? `${match[2]}:` : '0:';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    
    return `${hours}${minutes}${seconds}`;
  };

  // Prepare chart data
  const chartData = {
    labels: historicalData.map(item => item.date),
    datasets: [
      {
        label: 'Views',
        data: historicalData.map(item => item.views),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y'
      },
      {
        label: 'Likes',
        data: historicalData.map(item => item.likes),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y1'
      },
      {
        label: 'Comments',
        data: historicalData.map(item => item.comments),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Views'
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Likes & Comments'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        }
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            if (value >= 1000000) {
              return label + (value / 1000000).toFixed(2) + 'M';
            }
            if (value >= 1000) {
              return label + (value / 1000).toFixed(2) + 'K';
            }
            return label + value;
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="card">
        <button className="button secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Search
        </button>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img 
            src={videoDetails.snippet.thumbnails.medium.url} 
            alt={videoDetails.snippet.title}
            style={{ marginRight: '20px', marginBottom: '20px', maxWidth: '320px', width: '100%' }}
          />
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '24px', marginTop: 0 }}>{videoDetails.snippet.title}</h1>
            <p style={{ color: 'var(--secondary-color)' }}>
              {videoDetails.snippet.channelTitle} • {formatDate(videoDetails.snippet.publishedAt)}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ marginRight: '20px', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>Views</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                  {parseInt(videoDetails.statistics.viewCount, 10).toLocaleString()}
                </div>
              </div>
              
              <div style={{ marginRight: '20px', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>Likes</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                  {parseInt(videoDetails.statistics.likeCount, 10).toLocaleString()}
                </div>
              </div>
              
              <div style={{ marginRight: '20px', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>Comments</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                  {parseInt(videoDetails.statistics.commentCount, 10).toLocaleString()}
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>Duration</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                  {formatDuration(videoDetails.contentDetails.duration)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </div>
          <div 
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </div>
          <div 
            className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </div>
          <div 
            className={`tab ${activeTab === 'ai-analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-analysis')}
          >
            AI Analysis
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <h2>Video Description</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{videoDetails.snippet.description}</p>
            
            <h2>Key Metrics</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', margin: '10px', padding: '20px', backgroundColor: 'var(--hover-color)', borderRadius: '8px' }}>
                <h3>Engagement Rate</h3>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>
                  {((parseInt(videoDetails.statistics.likeCount, 10) + 
                    parseInt(videoDetails.statistics.commentCount, 10)) / 
                    parseInt(videoDetails.statistics.viewCount, 10) * 100).toFixed(2)}%
                </div>
                <p>Likes and comments relative to views</p>
              </div>
              
              <div style={{ flex: '1 1 200px', margin: '10px', padding: '20px', backgroundColor: 'var(--hover-color)', borderRadius: '8px' }}>
                <h3>Like Ratio</h3>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>
                  {(parseInt(videoDetails.statistics.likeCount, 10) / 
                    parseInt(videoDetails.statistics.viewCount, 10) * 100).toFixed(2)}%
                </div>
                <p>Percentage of viewers who liked the video</p>
              </div>
              
              <div style={{ flex: '1 1 200px', margin: '10px', padding: '20px', backgroundColor: 'var(--hover-color)', borderRadius: '8px' }}>
                <h3>Comment Rate</h3>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>
                  {(parseInt(videoDetails.statistics.commentCount, 10) / 
                    parseInt(videoDetails.statistics.viewCount, 10) * 100).toFixed(2)}%
                </div>
                <p>Percentage of viewers who commented</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div>
            <h2>Performance Trends</h2>
            <p>Historical data showing the growth of views, likes, and comments over time.</p>
            
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
            
            <p><em>Note: Historical data is simulated as YouTube API doesn't provide historical statistics.</em></p>
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div>
            <h2>Top Comments</h2>
            {comments.length === 0 ? (
              <p>No comments found for this video.</p>
            ) : (
              <div>
                {comments.slice(0, 10).map(comment => (
                  <div key={comment.id} style={{ padding: '15px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                      <img 
                        src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                        alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {comment.snippet.topLevelComment.snippet.authorDisplayName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                          {formatDate(comment.snippet.topLevelComment.snippet.publishedAt)}
                        </div>
                      </div>
                    </div>
                    <p>{comment.snippet.topLevelComment.snippet.textDisplay}</p>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>
                      <span style={{ marginRight: '15px' }}>
                        👍 {comment.snippet.topLevelComment.snippet.likeCount}
                      </span>
                      <span>
                        💬 {comment.snippet.totalReplyCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'ai-analysis' && (
          <AIAnalysis videoId={video.id} />
        )}
      </div>
    </div>
  );
};

export default VideoAnalytics;
