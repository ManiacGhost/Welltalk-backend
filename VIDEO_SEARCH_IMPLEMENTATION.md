# Video Search Implementation Guide

## Overview

The video search feature allows users to search videos by title, description, and category through a search bar on your homepage.

## Search Endpoint

### Basic Search
```
GET /api/v1/videos/search?q=query
```

**Query Parameters:**
- `q` (required): Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default: published)
- `category` (optional): Additional category filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Video Title",
      "description": "Video description",
      "category": "Wellness",
      "metadata": {
        "platform": "youtube",
        "embedUrl": "https://www.youtube.com/embed/..."
      }
    }
  ],
  "query": "search-term",
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  },
  "message": "Found 15 video(s) matching \"search-term\""
}
```

## Search Examples

### Simple Search
```bash
curl http://localhost:5000/api/v1/videos/search?q=yoga
```

### Search with Pagination
```bash
curl http://localhost:5000/api/v1/videos/search?q=wellness&page=1&limit=10
```

### Search with Category Filter
```bash
curl http://localhost:5000/api/v1/videos/search?q=meditation&category=Wellness&status=published
```

### Search with Multiple Filters
```bash
curl http://localhost:5000/api/v1/videos/search?q=fitness&category=Fitness&page=1&limit=5&status=published
```

## Frontend Integration

### React Search Bar Component

```javascript
import { useState } from 'react';

export function VideoSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    setError('');

    // Minimum 2 characters required
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/v1/videos/search?q=${encodeURIComponent(searchTerm)}&limit=10`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message);
        setResults([]);
      }
    } catch (err) {
      setError('Error searching videos');
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search videos..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />

      {loading && <p className="status">Searching...</p>}
      {error && <p className="error">{error}</p>}

      {query.length > 0 && results.length === 0 && !loading && (
        <p className="status">No videos found</p>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map(video => (
            <div key={video.id} className="result-item">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <span className="category">{video.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Debounced Search Component

```javascript
import { useState, useRef, useCallback } from 'react';

export function DebouncedVideoSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const performSearch = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/v1/videos/search?q=${encodeURIComponent(searchTerm)}&limit=10`
      );
      const data = await response.json();
      setResults(data.success ? data.data : []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }

    setLoading(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - wait 300ms before searching
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search videos (type to search)..."
        value={query}
        onChange={handleInputChange}
        className="search-input"
      />

      {loading && <p className="loading-indicator">Searching...</p>}

      <div className="results-grid">
        {results.map(video => (
          <div key={video.id} className="video-result">
            <img
              src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.metadata?.videoId}/hqdefault.jpg`}
              alt={video.title}
            />
            <h4>{video.title}</h4>
            <p>{video.description?.substring(0, 100)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Search with Filters

```javascript
import { useState } from 'react';

export function AdvancedVideoSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) {
      alert('Search term must be at least 2 characters');
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({
      q: query,
      limit: 15,
      ...(category && { category })
    });

    try {
      const response = await fetch(`/api/v1/videos/search?${params}`);
      const data = await response.json();
      setResults(data.success ? data.data : []);
    } catch (err) {
      console.error('Search error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="advanced-search">
      <div className="search-form">
        <input
          type="text"
          placeholder="Search videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Wellness">Wellness</option>
          <option value="Fitness">Fitness</option>
          <option value="Meditation">Meditation</option>
          <option value="Testimonials">Testimonials</option>
        </select>

        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="results">
          <p className="result-count">Found {results.length} videos</p>
          <div className="result-list">
            {results.map(video => (
              <div key={video.id} className="result-card">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <p className="meta">Category: {video.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Search Behavior

### What Gets Searched
- **Title** - Full text search
- **Description** - Full text search
- **Category** - Exact match (but also searchable)

### Search Limitations
- Minimum 2 characters required
- Case-insensitive search
- Returns published videos by default (use `status` parameter to change)
- Maximum 10 results per page (configurable with `limit` parameter)

### Performance Tips
1. **Use Debouncing** - Wait 300-500ms after user stops typing before searching
2. **Limit Results** - Set reasonable `limit` values (e.g., 10-20 per page)
3. **Add Loading States** - Show user that search is in progress
4. **Cache Results** - Cache popular searches to reduce API calls

## Error Handling

### Query Too Short
```json
{
  "success": false,
  "message": "Search query must be at least 2 characters"
}
```

### No Results
```json
{
  "success": true,
  "data": [],
  "query": "xyz",
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 0
  },
  "message": "Found 0 video(s) matching \"xyz\""
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error searching videos",
  "error": "Database connection failed"
}
```

## Postman Testing

Import the collection and use the pre-built requests:

### Search Videos
- **Endpoint:** `GET /api/v1/videos/search`
- **Parameters:**
  - `q`: yoga
  - `page`: 1
  - `limit`: 10
  - `status`: published
  - `category`: Fitness (optional)

## API Summary

| Aspect | Details |
|--------|---------|
| **Endpoint** | `GET /api/v1/videos/search` |
| **Min Query Length** | 2 characters |
| **Search Fields** | Title, Description, Category |
| **Default Status** | published |
| **Pagination** | Yes (page, limit) |
| **Authentication** | No |
| **Rate Limiting** | None (implement in production) |

## Production Recommendations

### 1. Add Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get('/search', searchLimiter, videoController.searchVideos);
```

### 2. Implement Caching
```javascript
const cache = require('memory-cache');

const searchVideos = async (req, res) => {
  const { q } = req.query;
  const cacheKey = `search_${q}`;
  
  // Check cache
  const cachedResults = cache.get(cacheKey);
  if (cachedResults) {
    return res.json(cachedResults);
  }
  
  // Perform search
  const results = /* search logic */;
  
  // Cache for 5 minutes
  cache.put(cacheKey, results, 5 * 60 * 1000);
  
  res.json(results);
};
```

### 3. Add Search Analytics
Track popular searches to improve SEO and content.

### 4. Add Search Suggestions
Consider implementing autocomplete/typeahead search.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No results returned | Check query is at least 2 characters |
| Slow search | Implement pagination with smaller limit |
| All results show | Verify status filter is set to "published" |
| Search hangs | Check database connection and indexes |
