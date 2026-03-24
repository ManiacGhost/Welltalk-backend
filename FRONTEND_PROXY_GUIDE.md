# Frontend Proxy Configuration Guide

## ✅ **Backend Status**
- **Server Running**: ✅ http://localhost:5000
- **Upload Endpoint**: ✅ http://localhost:5000/api/v1/upload
- **Health Check**: ✅ http://localhost:5000/api/health

## 🔧 **Frontend Proxy Setup**

### **Option 1: Vite Configuration (Recommended)**
Add this to your `vite.config.js`:

```javascript
export default defineConfig({
  // ... other config
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### **Option 2: Environment Variable**
Set this in your frontend `.env` file:

```bash
VITE_BACKEND_ORIGIN=http://localhost:5000
```

### **Option 3: Direct API Calls**
Update your frontend to use the full URL:

```javascript
const API_BASE_URL = 'http://localhost:5000';

// For image uploads
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/upload/single`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.success ? result.data.url : null;
};
```

## 🧪 **Test the Connection**

```bash
# Test backend is running
curl http://localhost:5000/api/health

# Test upload endpoint
curl http://localhost:5000/api/v1/upload

# Test CORS
curl -H "Origin: http://localhost:3000" http://localhost:5000/api/health
```

## 🎯 **Frontend Integration Example**

```javascript
// Replace base64 image handling with upload endpoint
const handleImageUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('http://localhost:5000/api/v1/upload/single', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      // Use the returned URL instead of base64
      const imageUrl = result.data.url;
      editor.insertContent(`<img src="${imageUrl}" alt="Uploaded image">`);
      return imageUrl;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    // Fallback to base64 if upload fails
    const base64 = await fileToBase64(file);
    editor.insertContent(`<img src="${base64}" alt="Image">`);
  }
};
```

## 📋 **Troubleshooting**

### **CORS Issues**
If you get CORS errors, the backend is already configured with:
```javascript
CORS_ORIGIN=http://localhost:3000
```

### **Proxy Not Working**
1. Restart your frontend dev server after changing proxy config
2. Check that port 5000 is not blocked
3. Verify backend is running

### **Upload Fails**
1. Check file size (max 50MB)
2. Verify image format (JPEG, PNG, WebP, GIF, SVG)
3. Check network tab for actual error

## 🚀 **Ready to Use**

Your backend is now:
- ✅ Running on port 5000
- ✅ Accepting uploads up to 50MB
- ✅ Serving files from `/uploads`
- ✅ CORS configured for localhost:3000

Update your frontend to use the upload endpoint instead of base64! 🎉
