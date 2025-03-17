import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import VideoGrid from './components/VideoGrid';
import ComparisonDashboard from './components/ComparisonDashboard';
import VideoAnalytics from './components/VideoAnalytics';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial trending videos when the app starts
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        console.log('Fetching trending videos...');
        const response = await fetch('/api/search?query=trending');
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending videos');
        }
        
        const data = await response.json();
        console.log('Trending videos loaded:', data.length);
        setSearchResults(data);
      } catch (err) {
        console.error('Error fetching trending videos:', err);
        setError('Failed to load trending videos. Please try searching instead.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  const handleSearch = async (query) => {
    console.log('Searching for:', query);
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/search?query=${encodeURIComponent(query)}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to search videos');
      }
      
      const data = await response.json();
      console.log('Search results count:', data.length);
      
      setSearchResults(data);
      setActiveTab('search');
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Expose search function to window object for Header component
  React.useEffect(() => {
    window.appSearch = handleSearch;
    
    return () => {
      delete window.appSearch;
    };
  }, []);

  const handleVideoSelect = (video) => {
    if (selectedVideos.some(v => v.id === video.id)) {
      setSelectedVideos(selectedVideos.filter(v => v.id !== video.id));
    } else {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const handleVideoAnalytics = (video) => {
    setCurrentVideo(video);
    setActiveTab('analytics');
  };

  const handleCompare = () => {
    if (selectedVideos.length > 0) {
      setActiveTab('compare');
    }
  };

  const renderContent = () => {
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

    switch (activeTab) {
      case 'search':
        return (
          <VideoGrid 
            videos={searchResults} 
            selectedVideos={selectedVideos}
            onVideoSelect={handleVideoSelect}
            onVideoAnalytics={handleVideoAnalytics}
          />
        );
      case 'compare':
        return (
          <ComparisonDashboard 
            videos={selectedVideos} 
            onVideoAnalytics={handleVideoAnalytics}
          />
        );
      case 'analytics':
        return (
          <VideoAnalytics 
            video={currentVideo} 
            onBack={() => setActiveTab('search')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <Header />
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </div>
        <div 
          className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={handleCompare}
        >
          Compare ({selectedVideos.length})
        </div>
        {currentVideo && (
          <div 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </div>
        )}
      </div>
      
      {activeTab === 'search' && (
        <SearchForm onSearch={handleSearch} />
      )}
      
      {renderContent()}
    </div>
  );
};

export default App;
