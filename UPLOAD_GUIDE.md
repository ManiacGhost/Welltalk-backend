# Test Upload Endpoints

## Single Image Upload
**POST** `/api/v1/upload/single`
- Form field name: `image`
- Supports: JPEG, PNG, WebP, GIF, SVG
- Max size: 50MB

**Example Response:**
```json
{
  "success": true,
  "data": {
    "filename": "inline-1710741234567-123456789.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "url": "/uploads/inline/inline-1710741234567-123456789.jpg",
    "fullUrl": "http://localhost:5000/uploads/inline/inline-1710741234567-123456789.jpg"
  },
  "message": "Image uploaded successfully"
}
```

## Multiple Image Upload
**POST** `/api/v1/upload/multiple`
- Form field name: `images`
- Supports up to 10 files at once
- Same formats and size limits as single upload

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "inline-1710741234567-123456789.jpg",
      "originalName": "image1.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "url": "/uploads/inline/inline-1710741234567-123456789.jpg",
      "fullUrl": "http://localhost:5000/uploads/inline/inline-1710741234567-123456789.jpg"
    }
  ],
  "message": "1 images uploaded successfully"
}
```

## Delete Image
**DELETE** `/api/v1/upload/:filename`
- Deletes the specified image file

## Usage in Blog/Event Content
You can now use these URLs in your blog content or event descriptions:
```html
<img src="/uploads/inline/inline-1710741234567-123456789.jpg" alt="Uploaded image">
```

## Updated Limits
- Blog/Event featured images: 50MB (increased from 10MB)
- Inline uploads: 50MB per file, 10 files max
- Additional formats: GIF and SVG support added
