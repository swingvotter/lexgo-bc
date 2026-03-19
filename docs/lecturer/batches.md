# Lecturer Batches API

## Overview
Lecturers can create and manage batches to organize students by enrollment year. Batches automatically populate with students who enrolled in courses during a specific year.

## Base URL
```
/api/v1/Batches
```

## Authentication
All endpoints require:
- Authentication via `authMiddleware`
- Lecturer role via `lecturerMiddleware`

---

## Endpoints

### 1. Create Batch
**POST** `/api/v1/Batches`

Creates a new batch and automatically populates it with students who enrolled in the specified year.

#### Request Body
```json
{
  "batchId": "BATCH2020",
  "batchName": "2020 Cohort",
  "batchYear": "2020",
  "courseId": "optional-course-id"
}
```

#### Parameters
- `batchId` (string, required): Unique identifier for the batch
- `batchName` (string, required): Display name for the batch
- `batchYear` (string, required): Year to filter students (e.g., "2020")
- `courseId` (string, optional): Filter students by specific course

#### Response (201)
```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batch": {
      "_id": "batch-object-id",
      "userId": "lecturer-id",
      "batchId": "BATCH2020",
      "batchName": "2020 Cohort",
      "batchYear": "2020",
      "createdAt": "2026-03-19T08:00:00.000Z",
      "updatedAt": "2026-03-19T08:00:00.000Z"
    },
    "studentsAdded": 25
  }
}
```

#### Notes
- Students are automatically added based on their enrollment `createdAt` year
- Only approved enrollments are included
- Duplicate students (by email) are prevented
- Student data includes: name, email, academic level, and program

---

### 2. Get All Batches
**GET** `/api/v1/Batches`

Retrieves all batches created by the authenticated lecturer with pagination and filtering.

#### Query Parameters
- `limit` (number, optional): Results per page (default: 25)
- `cursor` (string, optional): Pagination cursor
- `order` (string, optional): Sort order - "asc" or "desc" (default: "desc")
- `batchYear` (string, optional): Filter by year
- `batchName` (string, optional): Filter by name

#### Example Request
```
GET /api/v1/Batches?limit=10&batchYear=2020&order=asc
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "batch-id",
      "userId": "lecturer-id",
      "batchId": "BATCH2020",
      "batchName": "2020 Cohort",
      "batchYear": "2020",
      "createdAt": "2026-03-19T08:00:00.000Z",
      "updatedAt": "2026-03-19T08:00:00.000Z"
    }
  ],
  "nextCursor": "next-cursor-value",
  "hasMore": true
}
```

---

### 3. Get Single Batch
**GET** `/api/v1/Batches/:id`

Retrieves a specific batch with all associated students.

#### URL Parameters
- `id` (string, required): Batch ID

#### Response (200)
```json
{
  "success": true,
  "data": {
    "batch": {
      "_id": "batch-id",
      "userId": "lecturer-id",
      "batchId": "BATCH2020",
      "batchName": "2020 Cohort",
      "batchYear": "2020",
      "createdAt": "2026-03-19T08:00:00.000Z",
      "updatedAt": "2026-03-19T08:00:00.000Z"
    },
    "students": [
      {
        "_id": "student-data-id",
        "batchId": "batch-id",
        "studentName": "John Doe",
        "email": "john@example.com",
        "gpa": null,
        "studentLevel": "300",
        "studentProgram": "LL.B",
        "createdAt": "2026-03-19T08:00:00.000Z",
        "updatedAt": "2026-03-19T08:00:00.000Z"
      }
    ]
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Batch not found"
}
```

---

### 4. Delete Batch
**DELETE** `/api/v1/Batches/:id`

Deletes a batch and all associated student data.

#### URL Parameters
- `id` (string, required): Batch ID

#### Response (200)
```json
{
  "success": true,
  "message": "Batch deleted successfully"
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Batch not found"
}
```

#### Notes
- Deletes the batch and all `BatchData` entries
- Only the batch owner (lecturer) can delete their batches

---

## Database Models

### Batch Model
```javascript
{
  userId: ObjectId,        // Reference to lecturer
  batchId: String,         // Unique batch identifier
  batchName: String,       // Display name
  batchYear: String,       // Year (e.g., "2020")
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, batchId: 1 }`
- `{ userId: 1, batchYear: 1 }`
- `{ userId: 1, batchName: 1 }`
- `{ userId: 1, _id: -1 }`

### BatchData Model
```javascript
{
  batchId: ObjectId,       // Reference to Batch
  studentName: String,     // Full name
  email: String,           // Student email
  gpa: Number,             // GPA (nullable)
  studentLevel: String,    // Academic level
  studentProgram: String,  // Program (LL.B, LL.M, etc.)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ batchId: 1, email: 1 }`

---

## Access Control
- Lecturers can only view, create, and delete their own batches
- Batch ownership is determined by `userId` field
- All operations are scoped to the authenticated lecturer

---

## Use Cases

### Creating a Year-Based Batch
```javascript
// Create batch for all 2020 enrollments
POST /api/v1/Batches
{
  "batchId": "BATCH2020",
  "batchName": "2020 Academic Year",
  "batchYear": "2020"
}
```

### Creating a Course-Specific Batch
```javascript
// Create batch for specific course in 2021
POST /api/v1/Batches
{
  "batchId": "BATCH2021_LAW101",
  "batchName": "2021 Law 101 Students",
  "batchYear": "2021",
  "courseId": "course-object-id"
}
```

### Filtering Batches
```javascript
// Get all 2020 batches
GET /api/v1/Batches?batchYear=2020

// Get batches by name
GET /api/v1/Batches?batchName=2020%20Cohort
```
