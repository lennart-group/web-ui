import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { languages } from 'countries-list'

// Create language list from the countries-list library
const LANGUAGES = Object.entries(languages)
  .map(([code, langData]) => {
    // Handle different possible formats
    const name = typeof langData === 'string' ? langData : langData.name;
    return {
      name: name,
      code: code.toLowerCase(),
    };
  })
  .filter(lang => lang && lang.name) // Filter out any invalid entries
  .sort((a, b) => {
    if (!a.name || !b.name) return 0;
    return a.name.localeCompare(b.name);
  });

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial values from URL params
  const query = searchParams.get('q') || '';
  const initialAuthor = searchParams.get('author') || '';
  const initialLanguage = searchParams.get('language') || '';
  const initialYear = searchParams.get('year') || '';
  
  const [text, setText] = useState(query);
  const [results, setResults] = useState(null);
  console.log(results);
  
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const BASE_URL = "http://localhost:7000";

  // Filter states - initialize from URL params
  const [author, setAuthor] = useState(initialAuthor);
  const [language, setLanguage] = useState(initialLanguage);
  const [year, setYear] = useState(initialYear);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    if (query) {
      // Perform search with all filters from URL
      performSearch(query, initialAuthor, initialLanguage, initialYear);
    }
  }, [query, initialAuthor, initialLanguage, initialYear]);

  // Update document title
  useEffect(() => {
    if (query) {
      document.title = `${query} - Book Search`;
    }
  }, [query]);

  const performSearch = async (searchQuery, authorFilter = '', languageFilter = '', yearFilter = '') => {
    setLoading(true);

    try {
      let url = `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`;
      
      if (authorFilter) {
        url += `&author=${encodeURIComponent(authorFilter)}`;
      }
      if (languageFilter) {
        url += `&language=${encodeURIComponent(languageFilter)}`;
      }
      if (yearFilter) {
        url += `&year=${encodeURIComponent(yearFilter)}`;
      }

      console.log('Fetching:', url);
      const response = await fetch(url);
      const data = await response.json();
      setResults(data);
      
      // Update filter states with what was actually searched
      setAuthor(authorFilter);
      setLanguage(languageFilter);
      setYear(yearFilter);
    } catch (error) {
      console.error('Search error:', error);
      alert(`Error during search: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => {
    setText('');
    inputRef.current.focus();
  };

  const handleSearch = () => {
    if (text.trim()) {
      navigate(`/search?q=${encodeURIComponent(text)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleApplyFilters = () => {
    if (query) {
      // Update URL with filters
      let url = `/search?q=${encodeURIComponent(query)}`;
      
      if (author) {
        url += `&author=${encodeURIComponent(author)}`;
      }
      if (language) {
        url += `&language=${encodeURIComponent(language)}`;
      }
      if (year) {
        url += `&year=${encodeURIComponent(year)}`;
      }
      
      navigate(url);
    }
  };

  const handleClearFilters = () => {
    setAuthor('');
    setLanguage('');
    setYear('');
    // Navigate back to just the search term
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const selectLanguage = (code) => {
    setLanguage(code);
    setShowLanguageDropdown(false);
  };

  const goHome = () => {
    navigate('/');
  };

  // Get current year for year dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

  const selectedLang = LANGUAGES.find(l => l.code === language);

  return (
    <div className="app">
      {/* Search Header */}
      <div className="search-header show">
        <img 
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
          alt="Google"
          className="logo-small"
          onClick={goHome}
          style={{ cursor: 'pointer' }}
        />
        
        <div className="search-wrapper-small">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search"
          />

          {text && (
            <button className="clear-button" onClick={clearInput}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6"></path>
                <path d="m9 9 6 6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {results && (
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Author:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="filter-input"
            />
          </div>

          <div className="filter-group language-filter-group">
            <label className="filter-label">Language:</label>
            <div className="language-dropdown-wrapper">
              <button 
                className="filter-button language-select"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                type="button"
              >
                {selectedLang ? selectedLang.name : 'Select Language'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {showLanguageDropdown && LANGUAGES.length > 0 && (
                <div className="language-dropdown">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`language-option ${language === lang.code ? 'active' : ''}`}
                      onClick={() => selectLanguage(lang.code)}
                    >
                      <span className="lang-name">{lang.name}</span>
                      <span className="lang-code">({lang.code.toUpperCase()})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="filter-select"
            >
              <option value="">Any Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="filter-buttons">
            <button className="filter-apply-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>
            {(author || language || year) && (
              <button className="filter-clear-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Container */}
      <div className="results-container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : results && results.count === 0 ? (
          /* No Results Page */
          <div className="no-results">
            <div className="no-results-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <h2>No results found for "{results.query}"</h2>
            <p className="no-results-text">Try different keywords or check your spelling</p>
            <div className="no-results-suggestions">
              <p>Suggestions:</p>
              <ul>
                <li>Make sure all words are spelled correctly</li>
                <li>Try different keywords</li>
                <li>Try more general keywords</li>
                <li>Adjust your filters</li>
                {(author || language || year) && (
                  <li>Try removing some filters</li>
                )}
              </ul>
            </div>
          </div>
        ) : results ? (
          /* Results Found */
          <>
            <div className="results-info">
              About {results.count} results for "{results.query}"
              {(author || language || year) && (
                <div className="active-filters-display">
                  Filters applied:
                  {author && <span className="filter-tag">Author: {author}</span>}
                  {language && selectedLang && <span className="filter-tag">Language: {selectedLang.name}</span>}
                  {year && <span className="filter-tag">Year: {year}</span>}
                </div>
              )}
            </div>

            <div className="results-list">
              {results.results.map((book) => (
                <a 
                  key={book.book_id} 
                  href={`https://www.gutenberg.org/ebooks/${book.book_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-item-link"
                >
                  <div className="result-item">
                    <div className="result-url">Project Gutenberg #{book.book_id}</div>
                    <h3 className="result-title">{book.title}</h3>
                    <div className="result-snippet">
                      <strong>Author:</strong> {book.author} • <strong>Language:</strong> {book.language} • <strong>Date:</strong> {book.year}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default SearchPage;