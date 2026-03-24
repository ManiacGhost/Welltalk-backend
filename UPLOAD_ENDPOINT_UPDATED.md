# ✅ Upload Endpoint Updated to Match Frontend Requirements

## 🎯 **Updated Endpoints:**

### **POST /api/v1/upload/single**
- **Field name**: `file` (changed from `image`)
- **Response format**: Simple JSON with `url` and `path`
- **Example response**:
```json
{
  "url": "uploads/inline/inline-1710741234567-123456789.jpg",
  "path": "uploads/inline/inline-1710741234567-123456789.jpg"
}
```

### **POST /api/v1/upload/multiple**
- **Field name**: `files` (changed from `images`)
- **Response format**: Simple JSON with `urls` and `paths` arrays

## 📁 **Static File Serving:**
- ✅ **GET /uploads/\*** - Already configured and working
- Files served from: `uploads/` directory
- Example: `http://localhost:5000/uploads/inline/filename.jpg`

## 🚀 **Frontend Integration:**

```javascript
// Updated upload function
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // Use 'file' field name
  
  const response = await fetch('http://localhost:5000/api/v1/upload/single', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.url; // Simple URL string
};

// Usage in editor
const imageUrl = await uploadImage(file);
editor.insertContent(`<img src="/${imageUrl}" alt="Uploaded image">`);
```

## 🧪 **Test Commands:**

```bash
# Test endpoint info
curl http://localhost:5000/api/v1/upload

# Test upload (replace with actual file)
curl -X POST http://localhost:5000/api/v1/upload/single \
  -F "file=@/path/to/image.jpg"

# Expected response
{"url":"uploads/inline/inline-1710741234567-123456789.jpg","path":"uploads/inline/inline-1710741234567-123456789.jpg"}
```

## ✅ **All Requirements Met:**
- ✅ **Field name**: `file`
- ✅ **Response format**: `{ "url": "uploads/filename.jpg" }`
- ✅ **Static serving**: `GET /uploads/*`
- ✅ **File size limit**: 50MB (exceeds 5-10MB requirement)
- ✅ **Port**: 5000 (matches VITE_BACKEND_ORIGIN default)

Ready for frontend integration! 🎉
