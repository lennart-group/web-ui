import { useState, useRef } from 'react'
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


function HomePage() {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [language, setLanguage] = useState('')
  const [year, setYear] = useState('')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const inputRef = useRef(null)

  const clearInput = () => {
    setText('')
    inputRef.current.focus()
  }

  const handleSearch = () => {
    if (text.trim()) {
      // Build URL with filters
      let url = `/search?q=${encodeURIComponent(text)}`
      
      if (author) {
        url += `&author=${encodeURIComponent(author)}`
      }
      if (language) {
        url += `&language=${encodeURIComponent(language)}`
      }
      if (year) {
        url += `&year=${encodeURIComponent(year)}`
      }
      
      window.location.href = url
    }
  }

  const selectLanguage = (code) => {
    setLanguage(code)
    setShowLanguageDropdown(false)
  }

  const handleClearFilters = () => {
    setAuthor('')
    setLanguage('')
    setYear('')
  }

  // Get current year for year dropdown
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i)

  const selectedLang = LANGUAGES.find(l => l.code === language)

  return (
    <div className="container">
      <img 
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
        alt="Google"
        className="logo"
      />
      
      <div className="search-wrapper">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search books"
          autoFocus
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

      {/* Filter Section */}
      <div className="home-filters">
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

        {(author || language || year) && (
          <button className="filter-clear-btn-home" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="button-wrapper">
        <button className="google-button" onClick={handleSearch}>Search</button>
      </div>
    </div>
  )
}

export default HomePage