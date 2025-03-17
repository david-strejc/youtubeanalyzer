import React, { useState, useEffect } from 'react';

const AIAnalysis = ({ videoId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('general');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!videoId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/video/${videoId}/ai-analysis?analysisType=${analysisType}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI analysis');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [videoId, analysisType]);

  const handleAnalysisTypeChange = (type) => {
    setAnalysisType(type);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Generating AI analysis... This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error generating AI analysis: {error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card">
        <p>No analysis available.</p>
      </div>
    );
  }

  // Format the analysis text with proper line breaks and sections
  const formatAnalysisText = (text) => {
    // Replace numbered list patterns with styled versions
    const formattedText = text
      .replace(/(\d+)\.\s+([^\n]+)/g, '<strong>$1. $2</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
    
    return <p dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="ai-analysis">
      <div className="tabs">
        <div 
          className={`tab ${analysisType === 'general' ? 'active' : ''}`}
          onClick={() => handleAnalysisTypeChange('general')}
        >
          General Analysis
        </div>
        <div 
          className={`tab ${analysisType === 'content' ? 'active' : ''}`}
          onClick={() => handleAnalysisTypeChange('content')}
        >
          Content Analysis
        </div>
        <div 
          className={`tab ${analysisType === 'engagement' ? 'active' : ''}`}
          onClick={() => handleAnalysisTypeChange('engagement')}
        >
          Engagement Analysis
        </div>
        <div 
          className={`tab ${analysisType === 'growth' ? 'active' : ''}`}
          onClick={() => handleAnalysisTypeChange('growth')}
        >
          Growth Potential
        </div>
      </div>
      
      <div className="card">
        <h2>AI-Powered {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis</h2>
        <div className="ai-analysis-content">
          {formatAnalysisText(analysis.analysis)}
        </div>
        <div className="ai-analysis-footer">
          <p><em>Analysis powered by Google Gemini AI</em></p>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
