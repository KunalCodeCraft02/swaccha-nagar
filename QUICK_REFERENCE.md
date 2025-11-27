# Quick Reference & Troubleshooting Guide

## Quick Start (For Users)

### How to Upload a File:

1. **Navigate to Task Page**
   - Go to any task (e.g., /task2pointone)
   - Look for the "Upload Box" section

2. **Select or Drag File**
   - Click the upload box to select a PDF
   - OR drag a PDF file directly onto the box

3. **Submit**
   - Click "Submit Task" button
   - Wait for success message

4. **View Your Submission**
   - Click "View" button to open your submitted PDF
   - PDF opens in a new tab

## For Developers

### File Locations Quick Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Upload Config | `middleware/multerConfig.js` | Multer setup & validation |
| Upload Manager | `public/js/taskUploadManager.js` | Client-side upload logic |
| API Handlers | `router/router.js` | Backend upload endpoints |
| App Config | `app.js` | Route registration |
| User Schema | `model/users.js` | Database structure |
| Storage | `public/uploads/` | Where files are saved |

### Add Upload to New Task

To add upload functionality to a new task:

1. **Add to User Schema** (model/users.js):
```javascript
taskSubmissions: {
  newTaskId: {
    fileName: String,
    filePath: String,
    originalFileName: String,
    uploadDate: Date,
    fileSize: Number
  }
}
```

2. **Update Task View** (views/newtask.ejs):
```html
<head>
  <script src="/js/taskUploadManager.js"></script>
</head>

<button id="viewSubmissionBtn">View</button>
<div id="uploadBox">
  <input type="file" id="fileInput" accept="application/pdf">
  <p id="uploadText">Choose a file or drag it here</p>
</div>
<button id="submitBtn" class="submit-btn" disabled>Submit Task</button>

<script>
  new TaskUploadManager("newTaskId");
</script>
```

3. **Routes are automatic** - Already configured for all taskIds!

## Troubleshooting

### Issue: "File must be less than 10MB!"

**Solution:**
- Reduce PDF file size using:
  - Online PDF compressor
  - Adobe Acrobat compress feature
  - Linux command: `gs -sDEVICE=pdfwrite -q -dNOPAUSE -dBATCH -dSAFER -dCompatibilityLevel=1.3 -dUseCIEColor=true -r150 -sPAPERSIZE=a4 -sOutputFile=output.pdf input.pdf`

### Issue: "Only PDF files allowed!"

**Solution:**
- Make sure you're uploading a .pdf file
- Check file extension: must end with .pdf
- If renamed from another format, convert to PDF first

### Issue: Upload button disabled (grayed out)

**Solution:**
- Select a file first - button enables after file selection
- Ensure file is under 10MB
- Check browser console for errors (F12 → Console tab)

### Issue: "No submission found for this task"

**Solution:**
- You haven't uploaded a file for this task yet
- Upload a file using the upload box
- Try refreshing the page after upload

### Issue: Can't click View button

**Solution:**
- Make sure you've successfully uploaded a file first
- Check browser console for error messages
- Clear browser cache and try again

### Issue: PDF doesn't open in new tab

**Solution:**
- Check browser popup blocker settings
- Allow popups for localhost:3000
- Try right-clicking View and selecting "Open in new tab"

### Issue: File uploaded but can't find it in database

**Diagnostic Steps:**
```javascript
// In MongoDB:
db.users.findOne({email: "your-email@example.com"})
  .taskSubmissions.task2point1
// Should show file metadata
```

### Issue: "Error: ENOENT: no such file or directory"

**Solution:**
- Create uploads directory:
```bash
mkdir public/uploads
chmod 755 public/uploads
```

### Issue: Permission Denied uploading files

**Solution (Linux/Mac):**
```bash
chmod 755 public/uploads
chmod 644 public/uploads/*
```

**Solution (Windows):**
- Right-click `public/uploads` folder
- Properties → Security → Edit permissions
- Grant "Modify" permission for your user

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Only PDF files allowed!" | File is not PDF | Convert to PDF |
| "File must be less than 10MB!" | File too large | Compress PDF |
| "No submission found..." | No file uploaded | Upload a file first |
| "ENOENT: no such file..." | `/public/uploads/` missing | Create directory |
| "CORS error" | Cross-origin issue | Check same domain |
| "401 Unauthorized" | Not logged in | Login first |

## Environment Variables (if needed)

Add to `.env` file (create if doesn't exist):
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/swatchbharat
JWT_SECRET=your_secret_key
MAX_FILE_SIZE=10485760
```

## Database Backup & Recovery

### Backup user submissions:
```bash
mongodump --out=./backups
```

### Restore:
```bash
mongorestore ./backups
```

### Check specific user:
```bash
mongo
use swatchbharat
db.users.findOne({email: "user@example.com"}, {taskSubmissions: 1})
```

## Performance Tips

1. **Compress PDFs before uploading**
   - Reduces storage space
   - Faster downloads
   - Better for viewing

2. **Delete old uploads** (Optional cleanup):
```bash
# Remove files older than 30 days
find public/uploads -mtime +30 -delete
```

3. **Monitor storage**:
```bash
# Check upload folder size
du -sh public/uploads
```

## Testing Checklist

- [ ] Can upload PDF under 10MB
- [ ] Cannot upload non-PDF files
- [ ] Cannot upload files over 10MB
- [ ] After upload, view button works
- [ ] PDF opens in new tab
- [ ] Can re-upload to replace file
- [ ] File metadata saves to database
- [ ] File accessible at `/uploads/filename`
- [ ] Non-logged-in users cannot upload

## Code Review Checklist

```javascript
// ✅ Implemented features:
- [x] File upload with multipart/form-data
- [x] File validation (type, size)
- [x] Unique filename generation
- [x] Database storage of metadata
- [x] View/retrieve submissions
- [x] Delete submissions
- [x] Authentication middleware
- [x] Error handling
- [x] User-friendly messages
- [x] Drag-and-drop support
```

## Debug Mode

Enable detailed logging in `router/router.js`:

```javascript
// Add console logs
const uploadTaskFile = async (req, res) => {
    console.log("Upload request received");
    console.log("User ID:", req.user.userid);
    console.log("Task ID:", req.body.taskId);
    console.log("File:", req.file);
    // ... rest of code
}
```

Then check Node.js console output for detailed information.

## Important Notes

⚠️ **Do NOT:**
- Modify filenames manually (breaks references)
- Move files outside `/public/uploads/` (breaks paths)
- Delete user documents without backing up (loses submissions)
- Disable authentication for upload endpoints

✅ **DO:**
- Regularly backup MongoDB
- Monitor `/public/uploads/` disk space
- Keep files in `/public/uploads/` for easy serving
- Use authentication on all upload endpoints
- Compress PDFs before uploading

## Support

For issues not covered here:

1. Check browser console: F12 → Console tab
2. Check server logs: Terminal running Node.js server
3. Check database: MongoDB Compass or mongo shell
4. Check file system: `/public/uploads/` directory
5. Review error response from API: Network tab in DevTools

## Version Info

- **Node.js**: v14 or higher recommended
- **Express**: v4.x
- **Multer**: Latest version
- **MongoDB**: v4.4 or higher
- **Browser**: Modern browsers with FormData API support

## Next Development Steps

1. **Short term:**
   - Add upload progress bar
   - Add file preview thumbnail
   - Add delete submission button

2. **Medium term:**
   - Support multiple file formats
   - Add revision history
   - Add comments on submissions

3. **Long term:**
   - Cloud storage integration (AWS S3)
   - Antivirus scanning
   - Automated grading integration
   - Email notifications
