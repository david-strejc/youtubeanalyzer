import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonDashboard = ({ videos, onVideoAnalytics }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('views');

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!videos || videos.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const videoIds = videos.map(video => video.id);
        
        const response = await fetch('/api/videos/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ videoIds })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        
        const data = await response.json();
        setComparisonData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [videos]);

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
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="card">
        <p>No videos selected for comparison. Please select videos from the search results.</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: comparisonData.map(video => video.title.substring(0, 30) + (video.title.length > 30 ? '...' : '')),
    datasets: [
      {
        label: activeChart === 'views' ? 'Views' : 
               activeChart === 'likes' ? 'Likes' : 
               activeChart === 'comments' ? 'Comments' : 'Engagement Rate (%)',
        data: comparisonData.map(video => 
          activeChart === 'views' ? video.viewCount : 
          activeChart === 'likes' ? video.likeCount : 
          activeChart === 'comments' ? video.commentCount : 
          parseFloat(video.engagementRate)
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (activeChart === 'engagement') return value + '%';
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        }
      }
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
            if (activeChart === 'engagement') {
              return label + value.toFixed(2) + '%';
            }
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
        <h2>Video Comparison</h2>
        <p>Compare metrics across {videos.length} selected videos.</p>
        
        <div className="tabs">
          <div 
            className={`tab ${activeChart === 'views' ? 'active' : ''}`}
            onClick={() => setActiveChart('views')}
          >
            Views
          </div>
          <div 
            className={`tab ${activeChart === 'likes' ? 'active' : ''}`}
            onClick={() => setActiveChart('likes')}
          >
            Likes
          </div>
          <div 
            className={`tab ${activeChart === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveChart('comments')}
          >
            Comments
          </div>
          <div 
            className={`tab ${activeChart === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveChart('engagement')}
          >
            Engagement Rate
          </div>
        </div>
        
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="card">
        <h2>Comparison Table</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Video</th>
                <th>Channel</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Engagement Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map(video => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{video.channelTitle}</td>
                  <td>{video.viewCount.toLocaleString()}</td>
                  <td>{video.likeCount.toLocaleString()}</td>
                  <td>{video.commentCount.toLocaleString()}</td>
                  <td>{video.engagementRate}%</td>
                  <td>
                    <button 
                      className="button"
                      onClick={() => onVideoAnalytics(video)}
                    >
                      Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDashboard;
