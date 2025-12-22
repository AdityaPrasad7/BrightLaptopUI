import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const updateSearchQuery = (query) => {
    setSearchQuery(query);
    // Clear search results when query is cleared
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const updateSearchResults = (results) => {
    setSearchResults(results);
  };

  const setSearching = (searching) => {
    setIsSearching(searching);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        updateSearchQuery,
        updateSearchResults,
        setSearching,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};


