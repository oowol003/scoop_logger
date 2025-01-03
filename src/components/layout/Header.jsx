// Header.jsx
import React from 'react';

const Header = () => {
  const handleTitleClick = () => {
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 
            onClick={handleTitleClick}
            className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
          >
            Scoop Logger
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
