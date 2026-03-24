# 🔍 Gallery Images Debug Guide

## 🎯 **Problem Identified:**
Gallery images array is empty even when you upload images.

## 🔧 **Debug Steps Added:**
I've added extensive debug logging to both `createEvent` and `updateEvent` functions.

## 📋 **How to Debug:**

### **1. Start Server & Check Logs:**
```bash
npm run dev
```

### **2. Upload Gallery Images:**
Use Postman or curl to upload gallery images:

**POST /api/v1/events with Gallery Images:**
```bash
curl -X POST http://localhost:5000/api/v1/events \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Event" \
  -F "description=Test description" \
  -F "eventDate=2026-03-25" \
  -F "eventTime=10:00:00" \
  -F "location=Test Location" \
  -F "organizerName=Test Organizer" \
  -F "status=upcoming" \
  -F "coverImage=@/path/to/cover.jpg" \
  -F "galleryImages=@/path/to/gallery1.jpg" \
  -F "galleryImages=@/path/to/gallery2.jpg"
```

### **3. Check Console Output:**
Look for these debug messages in your console:
```
Gallery Images Debug:
req.files: { coverImage: [...], galleryImages: [...] }
req.body.galleryImages: undefined
bodyGalleryImages: []
Gallery file: gallery1.jpg -> Path: uploads/events/gallery1.jpg
Gallery file: gallery2.jpg -> Path: uploads/events/gallery2.jpg
Final galleryImages: ['uploads/events/gallery1.jpg', 'uploads/events/gallery2.jpg']
```

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Wrong Field Name**
**Problem**: Frontend sending `galleryImage` instead of `galleryImages`
**Solution**: Check that frontend sends `galleryImages` (plural)

### **Issue 2: Files Not Being Processed**
**Problem**: `req.files.galleryImages` is undefined
**Solution**: Check multer configuration and form field names

### **Issue 3: Path Issues**
**Problem**: Files uploaded but paths wrong
**Solution**: Check `uploads/events/` directory permissions

### **Issue 4: Database Not Saving**
**Problem**: Array processed but not saved to DB
**Solution**: Check Event model `galleryImages` field type

## 🔧 **Quick Fixes:**

### **1. Check Multer Config:**
```javascript
// In eventRoutes.js
upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }, // Must be plural
])
```

### **2. Check Frontend Form Data:**
```javascript
// FormData should use 'galleryImages' (plural)
formData.append('galleryImages', file1);
formData.append('galleryImages', file2);
```

### **3. Check Database Field:**
```javascript
// In Event model
galleryImages: {
  type: DataTypes.JSON,
  defaultValue: [],
}
```

## 🧪 **Test Steps:**

1. **Restart server** with debug logging
2. **Upload event with gallery images** using Postman
3. **Check console logs** for debug output
4. **Verify files exist** in `uploads/events/` directory
5. **Check database** to see if array was saved

## 📊 **Expected Results:**

**Console should show:**
- `req.files.galleryImages` with file objects
- `Final galleryImages` with array of paths
- Files created in `uploads/events/` folder

**Database should show:**
```json
{
  "galleryImages": [
    "uploads/events/1711234567890-image1.jpg",
    "uploads/events/1711234567891-image2.jpg"
  ]
}
```

## 🎯 **Next Steps:**

1. Run the debug version
2. Check console output
3. Share the debug logs if issue persists
4. I'll help fix the specific problem based on logs

The debug logging will show exactly where the issue is! 🚀
