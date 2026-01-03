# Courses API Documentation

**Base URL:** `/api/Courses`  
**Authentication:** Most endpoints require authentication (Bearer token in `Authorization` header). Endpoints that accept file uploads also require `multipart/form-data`.

---

## Overview

This document describes all endpoints related to course management used by lecturers: creating courses, uploading resources, extracting resource contents, generating course materials (AI), listing resources and materials, checking job status, and deleting courses and all related data.

All endpoints are mounted under the base URL above (see `routes/course.route.js`). Where relevant, query parameters for pagination, sorting and field selection are shown.

---

## Models (summary)

- Course

  - `lecturerId` (ObjectId) - owner
  - `title` (string)
  - `courseImageUrl` (string)
  - `coursePublicImageId` (string)` (Cloudinary public id)
  - `category`, `courseCode`, `institution`, `level`, `description`

- Resource

  - `lecturerId` (ObjectId)
  - `courseId` (ObjectId)
  - `fileName`, `fileExtension`, `fileSize`, `publicId` (Cloudinary), `url`

- ResourceContent

  - `courseId` (ObjectId)
  - `resourceId` (ObjectId)
  - `content` (string) — extracted/parsed text from PDF

- CourseMaterial

  - `lecturerId`, `courseId`
  - `title`, `introduction`, `chapters` (array of chapter objects)

---

## Endpoints

All responses use JSON. Below each endpoint shows required fields, request body (if any), and typical responses.

### 1) Create course

- **Endpoint:** `POST /api/Courses/`  
- **Auth:** Required (lecturer)  
- **Content-Type:** `multipart/form-data` (file field name: `courseImage`)  

Request body (form fields):

```json
{
  "title": "string (required)",
  "category": "string (required)",
  "institution": "string (required)",
  "level": "string (required)",
  "courseCode": "string (required)",
  "description": "string (optional)",
  "courseImage": "file (required)"
}
```

Response (201):

```json
{ "success": true, "message": "course created succesfully", "course": { /* course object */ } }
```

Errors: `400` missing fields or image upload failed, `500` server error.

---

### 2) Upload resource (PDF)

- **Endpoint:** `POST /api/Courses/resource/:courseId`  
- **Auth:** Required (must be course lecturer)  
- **Content-Type:** `multipart/form-data` (file field name: `resourceFile`)

Path params: `courseId` (required)

Behavior:
- Uploads PDF to Cloudinary (private/raw), stores signed `url`, saves `Resource` and extracts text to create `ResourceContent`.

Response (201):

```json
{ "success": true, "message": "resource uploaded succesfully", "resourceId": "<id>" }
```

Errors: `400`/`404` missing course/file or not lecturer, `500` server error.

Notes: The system extracts text with `pdf-parse` and stores content in `ResourceContent` for later processing.

---

### 3) Get raw resource contents for a course (concatenated)

- **Endpoint:** `GET /api/Courses/resourceContents/:courseId`  
- **Auth:** Required  

Path params: `courseId` (required)

Response (200):

```json
{
  "success": true,
  "message": "Resource contents fetched and concatenated successfully",
  "total": 2,
  "combined": "...concatenated text..."
}
```

This is used when creating AI-generated course materials; it returns the concatenated extracted text from all resources for the course.

---

### 4) Create course material (asynchronous, via queue)

- **Endpoint:** `POST /api/Courses/courseMaterial/:courseId`  
- **Auth:** Required  
- **Body:** none (server reads `ResourceContent`), or pass `courseId` in path

Behavior:
- Adds a job to the course material generation queue. The job uses combined resource content to prompt an AI to produce a structured `CourseMaterial` document.

Response (202 Accepted):

```json
{ "success": true, "message": "job created successfully", "jobId": "<job id>" }
```

Errors: `400` missing `courseId`, `404` course not found, `500` server error.

---

### 5) Get course material job status

- **Endpoint:** `GET /api/Courses/courseMaterial/status/:jobId`  
- **Auth:** Required  

Path params: `jobId` (required) — the queue job id returned when starting generation

Response examples:

*Processing:*
```json
{ "status": "waiting|active|delayed", "progress": 30, "message": "processing" }
```

*Completed:*
```json
{ "status": "completed", "courseMaterialId": "<id>" }
```

*Failed:*
```json
{ "status": "failed", "message": "error details" }
```

---

### 6) Get all CourseMaterials for a course

- **Endpoint:** `GET /api/Courses/courseMaterials/:courseId`  
- **Auth:** Required  

Path params: `courseId` (required)

Response (200):

```json
{ "success": true, "data": [ /* courseMaterial objects */ ] }
```

Each `CourseMaterial` contains `title`, `introduction`, and `chapters`.

---

### 7) List uploaded resources for a course (paginated)

- **Endpoint:** `GET /api/Courses/resources/:courseId`  
- **Auth:** Required  

Query params:
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)
- `sort` (optional, default: `-createdAt`)
- `fields` (optional, comma-separated fields to include; default excludes `__v`)

Response (200):

```json
{
  "success": true,
  "meta": { "total": 5, "page": 1, "limit": 20, "pages": 1 },
  "data": [ /* resource objects */ ]
}
```

Useful for listing course PDFs/resources and supporting pagination on the frontend.

---

### 8) Delete a course and all related data

- **Endpoint:** `DELETE /api/Courses/:courseId`  
- **Auth:** Required (must be course owner)  

Behavior:
- Deletes the course record, removes the course image from Cloudinary (if present), deletes all `Resource` records (and their Cloudinary files), deletes `ResourceContent` entries, and deletes `CourseMaterial` entries for the course.

Response (200):

```json
{ "success": true, "message": "course and related resources deleted" }
```

Errors: `401` unauthorized, `404` course not found or not owned by user, `500` server error.

Notes: Deletions of Cloudinary assets are attempted but non-blocking — if Cloudinary deletion fails the DB cleanup still proceeds and errors are logged.

---

## Authentication

- Include a valid JWT access token in the `Authorization` header for routes that require authentication:  
  `Authorization: Bearer <token>`

---

## File upload notes

- `POST /` (create course) expects `courseImage` as a file.  
- `POST /resource/:courseId` expects `resourceFile` (PDF).  
- Both endpoints use multer middleware; ensure Content-Type is `multipart/form-data`.

Cloudinary:
- Course images are uploaded as images; resources (PDFs) are uploaded as `resource_type: raw` and stored private — app generates signed URLs for access.

---

## Examples

1. Create course (curl):

```bash
curl -X POST "https://your-host/api/Courses" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Intro to X" \
  -F "category=Law" \
  -F "institution=ABC" \
  -F "level=100" \
  -F "courseCode=LAW101" \
  -F "courseImage=@/path/to/image.jpg"
```

2. Upload resource (curl):

```bash
curl -X POST "https://your-host/api/Courses/resource/<courseId>" \
  -H "Authorization: Bearer $TOKEN" \
  -F "resourceFile=@/path/to/doc.pdf"
```

---

## Implementation notes for maintainers

- Keep `ResourceContent` populated when uploading resources — the `createCourseMaterial` flow depends on it.
- Course material generation is asynchronous — frontend should poll `/courseMaterial/status/:jobId`.
- When deleting a course, delete Cloudinary assets first (best-effort), then remove DB records to avoid orphaned references.

---

If you want this split into smaller files (e.g., `create.md`, `resources.md`, `delete.md`) I can split the document the same way the `user/ai/quiz` docs are organized.
