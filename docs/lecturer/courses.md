# Courses API Documentation

**Base URL:** `/api/Courses`  
**Authentication:** Required for all endpoints (Bearer token in `Authorization` header).

---

## Overview

This document describes technical endpoints for course management. Lecturers and approved Sub-Lecturers can manage course content, while only the original Course Owner can perform administrative actions like course deletion or student enrollment management.

---

## 1. Create Course

Create a new course and upload a cover image.

- **Endpoint:** `POST /api/Courses/`  
- **Access:** Private (Lecturer)
- **Content-Type:** `multipart/form-data`

### Request Body (Form Data)
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | String | ✅ Yes | Course title |
| `category` | String | ✅ Yes | Academic category |
| `institution` | String | ✅ Yes | Name of the institution |
| `level` | String | ✅ Yes | Academic level (e.g., Level 100) |
| `courseCode` | String | ✅ Yes | Unique code (e.g., LAW101) |
| `description` | String | ❌ No | Detailed course description |
| `courseImage` | File | ✅ Yes | Image file for course cover |

---

## 2. Upload Resource (PDF/DOCX)

Upload educational materials to a course.

- **Endpoint:** `POST /api/Courses/resource/:courseId`  
- **Access:** Private (Course Owner or Approved Sub-Lecturer)
- **Content-Type:** `multipart/form-data`

### Parameters
- `courseId` (Path): The ID of the course.
- `resourceFile` (Form-Data File): The PDF or DOCX document.

### Behavior
1. Uploads file to Cloudinary private storage.
2. Extracts text for AI course material generation.
3. Saves metadata (no public URL stored in DB for security).

---

## 3. List Course Resources

Get a paginated list of resources for a course.

- **Endpoint:** `GET /api/Courses/resources/:courseId`  
- **Access:** Private (Authenticated Users)

### Response Property: `downloadUrl`
Each resource in the list includes a `downloadUrl` property (e.g., `/api/Courses/resource/download/:resourceId`). **Always use this proxy URL** to access the file, as it handles authentication and proper file headers.

---

## 4. Download/Proxy Resource

Securely download or preview a resource through the backend.

- **Endpoint:** `GET /api/Courses/resource/download/:resourceId`  
- **Access:** Private (Authenticated Users)

### Behavior
- Streams the file from Cloudinary.
- **PDFs**: Served with `Content-Type: application/pdf` and `inline` disposition for browser preview.
- **Other Files**: Served as `attachment` for direct download.
- Forwarding `Content-Length` for download progress.

---

## 5. Course Material Generation (AI)

- **Create Material (Job)**: `POST /api/Courses/courseMaterial/:courseId`
- **Check Status**: `GET /api/Courses/courseMaterial/status/:jobId`
- **Get All Materials**: `GET /api/Courses/courseMaterials/:courseId`

---

## 6. Delete Course

Permanently removes a course and **all** associated data.

- **Endpoint:** `DELETE /api/Courses/:courseId`  
- **Access:** Private (Course Owner Only)

### Cascading Deletion
Deleting a course automatically removes:
1. Course Image from Cloudinary.
2. All Resource files from Cloudinary.
3. All Lecturer Case documents from Cloudinary.
4. Database records for: Resources, Resource Contents, Course Materials, Lecturer Cases, **Enrollments**, **Quizzes**, **Quiz Submissions**, and **Sub-Lecturer records**.
