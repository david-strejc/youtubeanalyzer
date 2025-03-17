import React from 'react';

const Header = () => {
  const searchChannel = () => {
    // Get the search function from the window object (set by App.js)
    if (window.appSearch) {
      window.appSearch('https://www.youtube.com/@davidstrejc');
    } else {
      console.error('Search function not available');
    }
  };

  return (
    <div className="header">
      <div className="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
        <span>YouTube Analyzer</span>
      </div>
      <div className="featured-channel" onClick={searchChannel} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>Featured Channel:</span>
        <strong style={{ color: 'var(--primary-color)' }}>@davidstrejc</strong>
      </div>
    </div>
  );
};

export default Header;
