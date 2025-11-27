# File Upload Functionality Implementation Guide

## Overview
This document explains the file upload and storage system implemented for the SWATCH BHARAT task submission feature.

## Features Implemented

### 1. **User Model Enhancement** (`model/users.js`)
- Added `taskSubmissions` schema field to store file information for each task
- Stores: fileName, filePath, originalFileName, uploadDate, and fileSize
- Supports 6 tasks: task2point1, task2pointwo, task2pointhree, task3point1, task3pointwo, task3pointhree

### 2. **Multer Configuration** (`middleware/multerConfig.js`)
- Configures disk storage for file uploads
- Files stored in: `/public/uploads/`
- File naming: Original name + timestamp + random suffix for uniqueness
- File validation:
  - Only PDF files allowed
  - Maximum file size: 10MB
  - MIME type validation

### 3. **Backend Routes** (`router/router.js`)
Three new API endpoints added:

#### **POST /upload-task-file**
- Handles file uploads from the client
- Requires: file (multipart/form-data) and taskId (form field)
- Validates file and stores reference in user's database
- Returns: success status, file information, and error messages

#### **GET /get-task-submission**
- Retrieves submission details for a specific task
- Query parameter: taskId
- Returns: file path, original filename, upload date, file size
- Used to display existing submissions and view files

#### **POST /delete-task-submission**
- Removes a task submission
- Deletes both database record and physical file
- Body parameter: taskId

### 4. **Frontend Upload Manager** (`public/js/taskUploadManager.js`)
Reusable JavaScript class that handles:
- File selection via input or drag-and-drop
- File validation (PDF only, size limit)
- Upload submission with progress feedback
- View existing PDF submissions in new tab
- Load previous submission status on page load

### 5. **Task View Updates**
Updated all 6 task pages with:
- TaskUploadManager script reference
- Upload box for drag-and-drop/file selection
- View button with ID for submission viewing
- Submit button for file upload
- File name display area

## File Structure

```
public/
├── uploads/                    # Uploaded PDF files stored here
└── js/
    └── taskUploadManager.js    # Upload handler class

middleware/
└── multerConfig.js             # Multer configuration

model/
└── users.js                    # Updated with taskSubmissions field

router/
└── router.js                   # Upload endpoints and handlers

views/
├── tasktwopointone.ejs        # Updated with upload functionality
├── tasktwopointwo.ejs
├── tasktwopointhree.ejs
├── taskthreepointone.ejs
├── taskthreepointwo.ejs
└── taskthreepointhree.ejs

app.js                          # Routes registered here
```

## How It Works

### Upload Flow:
1. User selects or drags PDF file on task page
2. TaskUploadManager validates file (type, size)
3. File displayed in UI with filename
4. User clicks "Submit Task" button
5. File sent to `/upload-task-file` endpoint via FormData
6. Backend validates, saves to `/public/uploads/`, stores metadata in database
7. User receives success confirmation
8. File available for viewing via "View" button

### View Flow:
1. User clicks "View" button
2. Frontend fetches task submission via `/get-task-submission`
3. If file exists, opens PDF in new browser tab
4. User can read/download PDF

### Database Storage:
User document structure:
```javascript
{
  email: "user@example.com",
  password: "hashed",
  teamname: "team name",
  phoneno: 1234567890,
  teamCreated: true,
  taskSubmissions: {
    task2point1: {
      fileName: "filename-timestamp-random.pdf",
      filePath: "/uploads/filename-timestamp-random.pdf",
      originalFileName: "original-name.pdf",
      uploadDate: "2025-11-25T10:30:00Z",
      fileSize: 1024000
    },
    // ... other tasks
  }
}
```

## Security Features

1. **File Type Validation**: Only PDF files allowed (checked on both client and server)
2. **File Size Limit**: Maximum 10MB per file
3. **Unique Filenames**: Prevents overwriting using timestamp + random suffix
4. **Authentication**: All upload routes require user login (isLoggedin middleware)
5. **User-specific Storage**: Each user's files stored in database under their user ID

## Usage Example

### HTML Structure (in EJS files):
```html
<div class="upload-box" id="uploadBox">
    <input type="file" id="fileInput" accept="application/pdf">
    <div class="upload-icon">⬆</div>
    <p id="uploadText">Choose a file or drag it here</p>
    <span>PDF files only (max 10MB)</span>
</div>
<p id="fileName" class="file-name"></p>
<button id="submitBtn" class="submit-btn" disabled>Submit Task</button>
<button id="viewSubmissionBtn" class="view-btn">View</button>
```

### JavaScript Initialization:
```javascript
<script src="/js/taskUploadManager.js"></script>
<script>
    new TaskUploadManager("task2point1"); // Pass task ID
</script>
```

## API Response Examples

### Successful Upload:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "fileName": "report-1734076200000-123456789.pdf",
    "originalFileName": "report.pdf",
    "filePath": "/uploads/report-1734076200000-123456789.pdf",
    "uploadDate": "2025-11-25T10:30:00.000Z",
    "fileSize": 2048000
  }
}
```

### Get Submission:
```json
{
  "success": true,
  "submission": {
    "fileName": "report-1734076200000-123456789.pdf",
    "filePath": "/uploads/report-1734076200000-123456789.pdf",
    "originalFileName": "report.pdf",
    "uploadDate": "2025-11-25T10:30:00.000Z",
    "fileSize": 2048000
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error uploading file",
  "error": "Error details here"
}
```

## Testing

To test the functionality:

1. **Upload a file**:
   - Navigate to any task page
   - Select or drag a PDF file
   - Click "Submit Task"
   - Should see success message

2. **View uploaded file**:
   - After successful upload, click "View" button
   - PDF should open in new tab

3. **Re-upload (replace previous)**:
   - Select a different PDF
   - Click "Submit Task"
   - New file replaces old one in database

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Files not uploading | Check file is PDF and under 10MB |
| Permission denied | Ensure `/public/uploads/` directory exists and is writable |
| Can't view files | Verify file path is accessible and PDF was uploaded successfully |
| Upload shows error | Check console for detailed error message |

## Future Enhancements

1. Add file download instead of just viewing
2. Multiple file uploads per task
3. File type support (DOCX, XLSX, etc.)
4. Drag-and-drop area styling improvements
5. Upload progress bar
6. Revision history for submissions
7. File size formatting (MB, GB display)
8. Admin dashboard to view all submissions
