import React, { useState, useEffect } from 'react';

interface Suggestion {
  name: string;
  center: [number, number];
}

export default function SearchBar({ onSearchSelect }: { onSearchSelect: (center: [number, number], zoom: number) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const API_URL = "https://dec.science.uu.nl/api/";

  useEffect(() => {
    if (query.length >= 3) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  }, [query]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setSuggestions(data);
      setIsSuggestionsVisible(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionClick = (center: [number, number], name: string) => {
    console.log("Selected location:", name);
    
    onSearchSelect(center, 12); // Pass zoom level (12) with the selected location
    setQuery(''); // Clear input after selection
    setIsSuggestionsVisible(false); // Hide suggestions
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        width: '300px',
        height: isSuggestionsVisible ? '200px' : '55px',
        transition: 'height 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          style={{
            width: '95%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
        {isSuggestionsVisible && (
          <ul
            className="suggestions-list"
            style={{
              padding: '0',
              margin: '0',
              listStyle: 'none',
              background: 'white',
              border: '1px solid #ccc',
              position: 'absolute',
              width: '94%',
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion.center, suggestion.name)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                }}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}






