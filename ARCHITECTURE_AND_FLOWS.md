# File Upload System - Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Task Page (EJS Template)                     │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Upload Box (Drag & Drop)                      │  │  │
│  │  │  - Select PDF file                             │  │  │
│  │  │  - View button (Show previous submission)      │  │  │
│  │  │  - Submit button                               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                    ↓                                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  TaskUploadManager.js (Client-side)           │  │  │
│  │  │  - File validation (PDF, size)                │  │  │
│  │  │  - Drag & drop handling                       │  │  │
│  │  │  - AJAX upload request                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓↑
        ┌──────────────────────────────────────┐
        │  HTTP Requests to Backend APIs       │
        │  - POST /upload-task-file            │
        │  - GET /get-task-submission          │
        │  - POST /delete-task-submission      │
        └──────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   Node.js / Express Server                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  router/router.js (Controllers)                      │  │
│  │  - uploadTaskFile()                                  │  │
│  │  - getTaskSubmission()                               │  │
│  │  - deleteTaskSubmission()                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓↑                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  middleware/multerConfig.js                          │  │
│  │  - File storage configuration                        │  │
│  │  - File validation & size limits                     │  │
│  │  - Filename generation with timestamp               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓↑                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  File System                                         │  │
│  │  /public/uploads/ ← Uploaded PDF files stored here  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓↑                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB (users collection)                          │  │
│  │  - Stores taskSubmissions metadata                   │  │
│  │  - File paths, names, dates, sizes                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Upload Process Flow

```
START
  ↓
[User opens task page]
  ↓
[Page loads, TaskUploadManager initializes]
  ↓
[User selects/drags PDF file]
  ↓
[Client validates]
  ├─→ Is PDF? → NO → Show error → END
  ├─→ < 10MB? → NO → Show error → END
  └─→ YES → Continue
  ↓
[Display filename in UI]
  ↓
[User clicks "Submit Task"]
  ↓
[FormData created with file + taskId]
  ↓
[POST /upload-task-file sent to server]
  ↓
[Server receives request]
  ├─→ isLoggedin? → NO → Return 401 → END
  └─→ YES → Continue
  ↓
[Multer processes file]
  ├─→ Is valid PDF? → NO → Delete temp file, return error → END
  ├─→ < 10MB? → NO → Delete temp file, return error → END
  └─→ YES → Continue
  ↓
[Save file to /public/uploads/]
  ↓
[Update user document in MongoDB with file metadata]
  ├─→ fileName: "unique-timestamp-random.pdf"
  ├─→ filePath: "/uploads/unique-timestamp-random.pdf"
  ├─→ originalFileName: "user-filename.pdf"
  ├─→ uploadDate: new Date()
  └─→ fileSize: 2048000
  ↓
[Return success response to client]
  ↓
[Client shows "File uploaded successfully!"]
  ↓
[User can click "View" to see PDF or upload new file]
  ↓
END
```

## View/Download Process Flow

```
START
  ↓
[User clicks "View" button on task page]
  ↓
[TaskUploadManager calls fetch(/get-task-submission?taskId=...)]
  ↓
[Server receives GET request]
  ├─→ isLoggedin? → NO → Return 401 → END
  └─→ YES → Continue
  ↓
[Query user document for taskSubmissions[taskId]]
  ↓
[Submission found?]
  ├─→ NO → Return "No submission found" → Show alert on client → END
  └─→ YES → Continue
  ↓
[Return submission data (filePath, originalFileName, etc.)]
  ↓
[Client receives response]
  ↓
[Open window with filePath in new tab]
  ↓
[Browser displays/downloads PDF]
  ↓
END
```

## File Storage Example

### Directory Structure:
```
public/
└── uploads/
    ├── report-1734076200000-123456789.pdf    (task2point1)
    ├── analysis-1734076300000-987654321.pdf  (task2pointwo)
    ├── proposal-1734076400000-456789123.pdf  (task3pointhree)
    └── ... (other uploaded files)
```

### Database Entry (MongoDB):
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "student@example.com",
  "password": "$2b$12$hashedpassword...",
  "teamname": "Innovators",
  "phoneno": 9876543210,
  "teamCreated": true,
  
  "taskSubmissions": {
    
    "task2point1": {
      "fileName": "report-1734076200000-123456789.pdf",
      "filePath": "/uploads/report-1734076200000-123456789.pdf",
      "originalFileName": "my-report.pdf",
      "uploadDate": ISODate("2025-11-25T10:30:00.000Z"),
      "fileSize": 2048000
    },
    
    "task2pointwo": {
      "fileName": "analysis-1734076300000-987654321.pdf",
      "filePath": "/uploads/analysis-1734076300000-987654321.pdf",
      "originalFileName": "data-analysis.pdf",
      "uploadDate": ISODate("2025-11-25T10:35:00.000Z"),
      "fileSize": 1536000
    },
    
    "task3pointhree": {
      "fileName": "proposal-1734076400000-456789123.pdf",
      "filePath": "/uploads/proposal-1734076400000-456789123.pdf",
      "originalFileName": "business-proposal.pdf",
      "uploadDate": ISODate("2025-11-25T10:40:00.000Z"),
      "fileSize": 3072000
    }
    
    // Other tasks...
  }
}
```

## API Endpoints

### 1. Upload File
```
POST /upload-task-file
Headers: Cookie with auth token
Content-Type: multipart/form-data

Form Data:
- file: <PDF File>
- taskId: "task2point1"

Response (Success):
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "fileName": "report-1734076200000-123456789.pdf",
    "originalFileName": "my-report.pdf",
    "filePath": "/uploads/report-1734076200000-123456789.pdf",
    "uploadDate": "2025-11-25T10:30:00.000Z",
    "fileSize": 2048000
  }
}

Response (Error):
{
  "success": false,
  "message": "Only PDF files are allowed!",
  "error": "Error details"
}
```

### 2. Get Submission
```
GET /get-task-submission?taskId=task2point1
Headers: Cookie with auth token

Response (Success):
{
  "success": true,
  "submission": {
    "fileName": "report-1734076200000-123456789.pdf",
    "filePath": "/uploads/report-1734076200000-123456789.pdf",
    "originalFileName": "my-report.pdf",
    "uploadDate": "2025-11-25T10:30:00.000Z",
    "fileSize": 2048000
  }
}

Response (Not Found):
{
  "success": false,
  "message": "No submission found for this task"
}
```

### 3. Delete Submission
```
POST /delete-task-submission
Headers: Cookie with auth token
Content-Type: application/json

Body:
{
  "taskId": "task2point1"
}

Response:
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

## Security Checks

```
Request → Authentication Check
           ↓
        Is user logged in?
           ├─→ NO → Return 401 Unauthorized
           └─→ YES → Continue
           ↓
        File Validation
           ├─→ Is PDF file? → NO → Reject
           ├─→ < 10MB? → NO → Reject
           ├─→ Valid MIME type? → NO → Reject
           └─→ YES → Continue
           ↓
        Database Operations
           ├─→ Update user document
           └─→ Store relative file path (not absolute)
           ↓
        File System Operations
           ├─→ Save to /public/uploads/
           └─→ Make accessible via HTTP /uploads/
```

## Task IDs

The system supports these task IDs:
- `task2point1` → tasktwopointone.ejs
- `task2pointwo` → tasktwopointwo.ejs
- `task2pointhree` → tasktwopointhree.ejs
- `task3point1` → taskthreepointone.ejs
- `task3pointwo` → taskthreepointwo.ejs
- `task3pointhree` → taskthreepointhree.ejs

## Error Handling

```
Upload Error ─→ File Validation Failed?
            ├─→ YES ─→ Multer rejects, deletes temp file
            └─→ NO ─→ DB error?
                  ├─→ YES ─→ Catch error, respond 500
                  └─→ NO ─→ Success!

View Error ─→ Submission Found?
          ├─→ NO ─→ User sees "No submission found"
          └─→ YES ─→ File Path Valid?
                 ├─→ NO ─→ User sees "Error fetching submission"
                 └─→ YES ─→ PDF opens in new tab
```

## Performance Considerations

- **File Naming**: Unique names prevent conflicts and allow re-uploads
- **Database Queries**: Direct field access using taskId (no array iteration)
- **File Storage**: Local disk storage (fast), can be migrated to cloud (S3, etc.)
- **Caching**: Browser caches PDFs, can be disabled if needed
- **Concurrent Uploads**: Multer handles multiple uploads safely

## Scalability Path

```
Current: Local File Storage + MongoDB
  ↓
Phase 1: Add cloud storage (AWS S3, Google Cloud Storage)
  ↓
Phase 2: Add CDN for PDF delivery
  ↓
Phase 3: Add image optimization & compression
  ↓
Phase 4: Add antivirus scanning for uploads
  ↓
Phase 5: Add compliance monitoring & audit logs
```
