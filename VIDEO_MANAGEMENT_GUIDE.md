# Video Management System Setup Guide

## Overview

The Video Management System allows admin users to add video links to the database, which are then displayed on the homepage. Videos support YouTube, Vimeo, and custom video URLs with features like featured videos, categories, display ordering, and view tracking.

## Features

✅ **CRUD Operations** - Create, read, update, and delete videos  
✅ **Featured Videos** - Mark videos as featured for homepage display  
✅ **Video Categories** - Organize videos by category  
✅ **Display Ordering** - Custom ordering of videos on homepage  
✅ **View Tracking** - Track video views  
✅ **Multiple Platforms** - Support YouTube, Vimeo, and custom video URLs  
✅ **Status Management** - Draft, Published, and Archived statuses  
✅ **Video Statistics** - Admin dashboard stats  
✅ **Pagination** - Efficient data retrieval  

## Database Schema

### Videos Table

```sql
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  videoUrl VARCHAR(500) NOT NULL,
  thumbnailUrl VARCHAR(500),
  duration INT,
  category VARCHAR(100),
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  displayOrder INT DEFAULT 0,
  views INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  tags JSON DEFAULT '[]',
  metadata JSON,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  KEY(status),
  KEY(featured),
  KEY(displayOrder)
);
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get All Videos
```
GET /api/v1/videos
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (draft|published|archived, default: published)
- `featured` (optional): Filter featured videos (true|false)
- `category` (optional): Filter by category
- `sortBy` (optional): Sort order (displayOrder|newest|oldest|views, default: displayOrder)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Wellness Tips",
      "description": "Learn wellness tips",
      "videoUrl": "https://www.youtube.com/watch?v=...",
      "thumbnailUrl": "https://...",
      "duration": 300,
      "category": "Wellness",
      "status": "published",
      "displayOrder": 0,
      "views": 150,
      "featured": true,
      "tags": ["wellness", "tips"],
      "metadata": {
        "platform": "youtube",
        "videoId": "...",
        "embedUrl": "https://www.youtube.com/embed/..."
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  },
  "message": "Videos fetched successfully"
}
```

#### 2. Get Featured Videos (Homepage)
```
GET /api/v1/videos/featured
```

**Query Parameters:**
- `limit` (optional): Number of featured videos (default: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Featured Video",
      "videoUrl": "https://www.youtube.com/watch?v=...",
      "metadata": {
        "platform": "youtube",
        "embedUrl": "https://www.youtube.com/embed/..."
      }
    }
  ],
  "message": "Featured videos fetched successfully"
}
```

#### 3. Get Videos by Category
```
GET /api/v1/videos/category/:category
```

**Path Parameters:**
- `category`: Video category name

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/v1/videos/category/Wellness?page=1&limit=10
```

#### 4. Get Single Video by ID
```
GET /api/v1/videos/:id
```

**Path Parameters:**
- `id`: Video ID

**Note:** This endpoint increments the view count automatically.

**Example:**
```
GET /api/v1/videos/1
```

### Admin Endpoints (Protected)

#### 5. Create Video
```
POST /api/v1/videos
```

**Request Body:**
```json
{
  "title": "Meditation Basics",
  "description": "Learn the basics of meditation",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnailUrl": "https://custom-thumbnail-url.com/image.jpg",
  "duration": 600,
  "category": "Wellness",
  "status": "published",
  "displayOrder": 0,
  "featured": true,
  "tags": ["meditation", "wellness", "beginner"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Meditation Basics",
    "description": "Learn the basics of meditation",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailUrl": "https://custom-thumbnail-url.com/image.jpg",
    "duration": 600,
    "category": "Wellness",
    "status": "published",
    "displayOrder": 0,
    "views": 0,
    "featured": true,
    "tags": ["meditation", "wellness", "beginner"],
    "metadata": {
      "platform": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Video created successfully"
}
```

#### 6. Update Video
```
PUT /api/v1/videos/:id
```

**Path Parameters:**
- `id`: Video ID

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "featured": false,
  "status": "draft"
}
```

#### 7. Delete Video
```
DELETE /api/v1/videos/:id
```

**Path Parameters:**
- `id`: Video ID

#### 8. Reorder Videos
```
PUT /api/v1/videos/reorder
```

**Request Body:**
```json
{
  "videoIds": [3, 1, 2, 5, 4]
}
```

**Note:** This updates the `displayOrder` based on array position.

#### 9. Get Video Statistics
```
GET /api/v1/videos/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVideos": 25,
    "publishedVideos": 20,
    "featuredVideos": 5,
    "draftVideos": 3,
    "archivedVideos": 2,
    "totalViews": 5420
  },
  "message": "Video statistics fetched successfully"
}
```

## Usage Examples

### 1. Add Video via cURL

**YouTube Video:**
```bash
curl -X POST http://localhost:5000/api/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Yoga for Beginners",
    "description": "A complete guide to starting yoga",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "category": "Fitness",
    "featured": true,
    "tags": ["yoga", "fitness", "beginner"]
  }'
```

**Vimeo Video:**
```bash
curl -X POST http://localhost:5000/api/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mindfulness Session",
    "description": "A guided mindfulness session",
    "videoUrl": "https://vimeo.com/123456789",
    "category": "Wellness",
    "featured": false,
    "tags": ["mindfulness"]
  }'
```

### 2. Fetch Featured Videos for Homepage

```bash
curl http://localhost:5000/api/v1/videos/featured?limit=6
```

### 3. Get Videos by Category

```bash
curl http://localhost:5000/api/v1/videos/category/Wellness?page=1&limit=10
```

### 4. Update a Video

```bash
curl -X PUT http://localhost:5000/api/v1/videos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "featured": false,
    "status": "archived"
  }'
```

### 5. Reorder Videos

```bash
curl -X PUT http://localhost:5000/api/v1/videos/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "videoIds": [5, 2, 1, 3, 4]
  }'
```

## Frontend Integration

### React Example

```javascript
// Fetch featured videos for homepage
async function getFeaturedVideos(limit = 6) {
  const response = await fetch(
    `http://localhost:5000/api/v1/videos/featured?limit=${limit}`
  );
  return await response.json();
}

// Fetch all video categories
async function getVideosByCategory(category) {
  const response = await fetch(
    `http://localhost:5000/api/v1/videos/category/${category}`
  );
  return await response.json();
}

// Admin: Create new video
async function createVideo(videoData) {
  const response = await fetch('http://localhost:5000/api/v1/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(videoData)
  });
  return await response.json();
}

// Display featured videos
function VideoGallery({ videos }) {
  return (
    <div className="video-gallery">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <img 
            src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.metadata?.videoId}/hqdefault.jpg`}
            alt={video.title}
          />
          <h3>{video.title}</h3>
          <p>{video.description}</p>
          
          {/* Video player */}
          {video.metadata?.embedUrl && (
            <iframe
              src={video.metadata.embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Admin panel: Manage videos
function AdminVideoManager() {
  const [videos, setVideos] = useState([]);
  
  const handleAddVideo = async (formData) => {
    const result = await createVideo(formData);
    if (result.success) {
      setVideos([...videos, result.data]);
    }
  };
  
  return (
    <div className="admin-videos">
      <CreateVideoForm onSubmit={handleAddVideo} />
      <VideoList videos={videos} />
    </div>
  );
}
```

## Platform Support

### YouTube
**URL Formats Supported:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

**Auto-generated:**
- Embed URL: `https://www.youtube.com/embed/VIDEO_ID`

### Vimeo
**URL Formats Supported:**
- `https://vimeo.com/VIDEO_ID`

**Auto-generated:**
- Embed URL: `https://player.vimeo.com/video/VIDEO_ID`

### Custom Videos
- Supports any valid video URL
- Use as embed URL directly

## Video Statuses

| Status | Description | Public |
|--------|-------------|--------|
| **published** | Video is live and visible | ✅ Yes |
| **draft** | Video is being prepared | ❌ No |
| **archived** | Video is archived/hidden | ❌ No |

## Best Practices

### 1. Video Ordering
- Use `displayOrder` field for consistent ordering
- Lower numbers appear first
- Use the `/reorder` endpoint to update multiple videos at once

### 2. Featured Videos
- Mark 5-10 videos as featured for homepage
- Use featured videos to highlight quality content
- Regularly update featured videos

### 3. Video Metadata
- Always provide descriptive titles
- Write meaningful descriptions for SEO
- Use relevant tags for categorization

### 4. Thumbnails
- Provide custom thumbnails for better UX
- Use high-quality images (1280x720 minimum)
- For YouTube/Vimeo, auto-thumbnails are generated

### 5. Categories
- Use consistent category names
- Keep category count reasonable (3-8 categories)
- Examples: "Wellness", "Fitness", "Meditation", "Testimonials"

## Troubleshooting

### Issue: Video URL not recognized
**Solution:** Ensure the URL is in a supported format:
- YouTube: Include `watch?v=` or use `youtu.be/`
- Vimeo: Include the video ID
- Custom: Ensure it's a valid URL

### Issue: Embed URL not generated
**Solution:** Check if the video URL is valid and properly formatted. The system will auto-generate embed URLs for YouTube and Vimeo.

### Issue: Featured videos not showing
**Solution:** Ensure:
1. `featured: true` is set
2. `status: "published"` is set
3. Query the endpoint: `/api/v1/videos/featured`

### Issue: Videos not displaying in order
**Solution:** 
1. Check `displayOrder` values
2. Use `/reorder` endpoint to set correct order
3. Verify sort parameter in GET request

## Migration Instructions

To add the videos table to an existing database:

```bash
npm run migrate
```

This will run the migration file `005-create-videos.js` and create the videos table.

## API Summary Table

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/v1/videos` | Get all videos | ❌ |
| GET | `/api/v1/videos/featured` | Get featured videos | ❌ |
| GET | `/api/v1/videos/category/:category` | Get videos by category | ❌ |
| GET | `/api/v1/videos/:id` | Get single video | ❌ |
| POST | `/api/v1/videos` | Create video | ✅ |
| PUT | `/api/v1/videos/:id` | Update video | ✅ |
| DELETE | `/api/v1/videos/:id` | Delete video | ✅ |
| PUT | `/api/v1/videos/reorder` | Reorder videos | ✅ |
| GET | `/api/v1/videos/stats` | Get statistics | ✅ |

## Security Considerations

⚠️ **Production Deployment:**
- Add authentication middleware to POST, PUT, DELETE endpoints
- Implement role-based access control (RBAC) for admin operations
- Validate all user inputs server-side
- Use HTTPS for all API calls
- Implement rate limiting for public endpoints

**Example Auth Middleware:**
```javascript
// Add to admin routes
const authenticateAdmin = require('../middlewares/authMiddleware');

router.post('/', authenticateAdmin, validateVideo, videoController.createVideo);
router.put('/:id', authenticateAdmin, validateVideo, videoController.updateVideo);
router.delete('/:id', authenticateAdmin, videoController.deleteVideo);
```
