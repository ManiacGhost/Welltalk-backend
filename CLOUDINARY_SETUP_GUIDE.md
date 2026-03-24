# Cloudinary Image Upload Setup Guide

## Overview
This guide explains how to set up and use Cloudinary for image uploads in your Welltalk backend. Images uploaded through Cloudinary are automatically stored in the database as CDN URLs and returned when fetching blog, event, and article details.

## Step 1: Set Up Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your **Dashboard**
4. Copy your credentials:
   - **Cloud Name** (top of dashboard)
   - **API Key** (settings/security)
   - **API Secret** (settings/security)

⚠️ **Important:** Keep your API Secret confidential. Never commit it to version control.

## Step 2: Configure Environment Variables

Update your `.env` file with your Cloudinary credentials:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 3: Understanding Upload Endpoints

### Featured/Thumbnail Image Upload
**Endpoint:** `POST /api/v1/upload/featured`

Used for:
- Blog featured images
- Event cover images
- Article thumbnails

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/upload/featured \
  -F "file=@image.jpg" \
  -F "type=blogs"
```

**Form Data:**
- `file` (required): Image file
- `type` (optional): `blogs`, `articles`, or `events` (default: `blogs`)

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/{cloud_name}/image/upload/...",
  "message": "Featured image uploaded successfully"
}
```

### Inline/Body Image Upload
**Endpoint:** `POST /api/v1/upload/inline`

Used for:
- Images embedded in blog/article content
- Images in event descriptions
- Rich text editor images

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/upload/inline \
  -F "file=@image.jpg" \
  -F "type=blogs"
```

**Form Data:**
- `file` (required): Image file
- `type` (optional): `blogs`, `articles`, or `events` (default: `blogs`)

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/{cloud_name}/image/upload/...",
  "message": "Inline image uploaded successfully"
}
```

### Gallery Image Upload
**Endpoint:** `POST /api/v1/upload/gallery`

Used for:
- Event gallery images
- Blog/article image galleries
- Multiple images at once

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/upload/gallery \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "type=events"
```

**Form Data:**
- `files` (required): Multiple image files
- `type` (optional): `events`, `blogs`, or `articles` (default: `events`)

**Response:**
```json
{
  "success": true,
  "urls": [
    "https://res.cloudinary.com/{cloud_name}/image/upload/...",
    "https://res.cloudinary.com/{cloud_name}/image/upload/..."
  ],
  "message": "Gallery images uploaded successfully"
}
```

### Delete Image
**Endpoint:** `DELETE /api/v1/upload/delete`

Removes an image from Cloudinary.

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/v1/upload/delete \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://res.cloudinary.com/{cloud_name}/image/upload/..."}'
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Step 4: Using in Your CRUD Operations

### Creating a Blog with Featured Image

1. **Upload featured image first:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/upload/featured \
     -F "file=@thumbnail.jpg" \
     -F "type=blogs"
   ```
   
   Save the returned `url`.

2. **Create blog with the returned URL:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/blogs \
     -H "Content-Type: application/json" \
     -d '{
       "title": "My Blog Post",
       "content": "Blog content here",
       "featuredImage": "https://res.cloudinary.com/...",
       "author": "John Doe",
       "categoryId": 1
     }'
   ```

### Creating a Blog with Inline Images

Use the rich text editor in your frontend to insert images:

1. **When user selects image in editor:**
   ```javascript
   // Upload inline image
   const formData = new FormData();
   formData.append('file', imageFile);
   formData.append('type', 'blogs');
   
   const response = await fetch('/api/v1/upload/inline', {
     method: 'POST',
     body: formData
   });
   const { url } = await response.json();
   ```

2. **Insert the CDN URL in the content:**
   ```html
   <img src="https://res.cloudinary.com/..." alt="description" />
   ```

3. **Save the blog/article with image URLs in content**

### Creating an Event with Gallery

1. **Upload gallery images:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/upload/gallery \
     -F "files=@photo1.jpg" \
     -F "files=@photo2.jpg" \
     -F "type=events"
   ```
   
   Save the returned `urls` array.

2. **Create event with gallery:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/events \
     -H "Content-Type: application/json" \
     -d '{
       "title": "My Event",
       "description": "Event description",
       "coverImage": "https://res.cloudinary.com/...",
       "galleryImages": [
         "https://res.cloudinary.com/...",
         "https://res.cloudinary.com/..."
       ],
       "eventDate": "2024-12-25",
       "eventTime": "18:00",
       "location": "Event Location"
     }'
   ```

## Step 5: Retrieving Data with Images

### Get Blog with Images
```bash
curl http://localhost:5000/api/v1/blogs/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Blog Post",
    "content": "...",
    "featuredImage": "https://res.cloudinary.com/...",
    "author": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Event with Gallery Images
```bash
curl http://localhost:5000/api/v1/events/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Event",
    "coverImage": "https://res.cloudinary.com/...",
    "galleryImages": [
      "https://res.cloudinary.com/...",
      "https://res.cloudinary.com/..."
    ],
    "eventDate": "2024-12-25",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Step 6: Frontend Integration Example

### React/JavaScript Example

```javascript
// Upload featured image
async function uploadFeaturedImage(file, type = 'blogs') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const response = await fetch('/api/v1/upload/featured', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
}

// Upload inline images
async function uploadInlineImage(file, type = 'blogs') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const response = await fetch('/api/v1/upload/inline', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
}

// Upload gallery images
async function uploadGalleryImages(files, type = 'events') {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('type', type);
  
  const response = await fetch('/api/v1/upload/gallery', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
}

// Create blog with featured image
async function createBlogWithImage(blogData, featuredImageFile) {
  // Upload featured image first
  const { url: featuredImageUrl } = await uploadFeaturedImage(
    featuredImageFile,
    'blogs'
  );
  
  // Create blog with image URL
  const response = await fetch('/api/v1/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...blogData,
      featuredImage: featuredImageUrl
    })
  });
  
  return await response.json();
}
```

## Step 7: Cloudinary Folder Structure

Your images will be automatically organized in Cloudinary:

```
welltalk/
├── blogs/
│   ├── featured/      (Blog featured images)
│   ├── inline/        (Blog body images)
│   └── gallery/       (Blog gallery images)
├── articles/
│   ├── featured/
│   ├── inline/
│   └── gallery/
└── events/
    ├── featured/      (Event cover images)
    ├── inline/        (Event description images)
    └── gallery/       (Event gallery images)
```

## Step 8: Best Practices

### Image Optimization
- Cloudinary automatically optimizes images for web
- Use `quality: 'auto'` in the upload (already configured)
- Fetch format is set to `auto` for best performance

### File Size Management
- Frontend limit: 50MB per file
- Maximum 10 files in one upload request
- Cloudinary handles compression

### Error Handling
```javascript
try {
  const { url } = await uploadFeaturedImage(file);
  // Use the URL
} catch (error) {
  console.error('Upload failed:', error);
  // Show error to user
}
```

### Deleting Images
Always delete old images when updating:

```javascript
// Delete old image before uploading new one
if (existingImageUrl) {
  await fetch('/api/v1/upload/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: existingImageUrl })
  });
}

// Upload new image
const { url: newImageUrl } = await uploadFeaturedImage(newImageFile);
```

## Troubleshooting

### "API key not found" Error
- Verify `CLOUDINARY_API_KEY` is set in `.env`
- Restart your server after updating `.env`

### "Invalid cloud name" Error
- Check that `CLOUDINARY_CLOUD_NAME` is correct
- Remove any spaces in the environment variable

### Upload Times Out
- Check your image file size (max 50MB)
- Verify internet connection to Cloudinary servers
- Check Cloudinary account limits (free tier: 10GB/month)

### Images Not Found
- Ensure Cloudinary credentials in `.env` are correct
- Check that images are being stored to the correct folder
- Verify the response URL format

## Monitoring Uploads

Check your Cloudinary dashboard to:
- View all uploaded images
- Monitor storage usage
- Check delivery metrics
- Manage API settings

## API Specifications Summary

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| POST | `/api/v1/upload/featured` | Upload featured/cover image | file, type |
| POST | `/api/v1/upload/inline` | Upload inline/body image | file, type |
| POST | `/api/v1/upload/gallery` | Upload multiple gallery images | files, type |
| DELETE | `/api/v1/upload/delete` | Delete image from Cloudinary | imageUrl |
