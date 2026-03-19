# Dean & Vice Dean API

## Overview
Deans and Vice Deans have administrative access to view and manage data within their university. All endpoints are scoped to the dean's university - they can only access data from lecturers and students within their institution.

## Base URL
```
/api/v1/Dean
```

## Authentication
All endpoints require:
- Authentication via `authMiddleware`
- Dean or Vice Dean role via `deanMiddleware`

## Access Control
- **University Scoping**: Deans can only access data from their own university
- **Roles**: `dean` and `viceDean` roles have access
- **Restriction**: Each university can have only one dean
- **Hierarchy**: 
  - Lecturers → See only their own data
  - Dean → Sees all data in their university

---

## Endpoints

### 1. Fetch Lecturers
**GET** `/api/v1/Dean/lecturers`

Retrieves all lecturers in the dean's university with course counts.

#### Query Parameters
- `limit` (number, optional): Results per page (default: 25)
- `cursor` (string, optional): Pagination cursor
- `search` (string, optional): Search by name or email (uses text index)

#### Example Request
```
GET /api/v1/Dean/lecturers?limit=10&search=john
```

#### Response (200)
```json
{
  "success": true,
  "message": "Lecturers fetched successfully",
  "data": [
    {
      "_id": "lecturer-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "university": "University of Lagos",
      "numberOfCourses": 5,
      "createdAt": "2025-01-15T08:00:00.000Z"
    }
  ],
  "totalLecturers": 45,
  "totalCourses": 120,
  "nextCursor": "next-cursor-value",
  "hasMore": true
}
```

#### Response Fields
- `data`: Array of lecturer objects
- `totalLecturers`: Total count of lecturers in the university
- `totalCourses`: Total count of all courses in the university
- `numberOfCourses`: Per-lecturer course count

---

### 2. Fetch Courses
**GET** `/api/v1/Dean/courses`

Retrieves all courses created by lecturers in the dean's university.

#### Query Parameters
- `limit` (number, optional): Results per page (default: 25)
- `cursor` (string, optional): Pagination cursor
- `search` (string, optional): Search by title, code, or category (uses text index)

#### Example Request
```
GET /api/v1/Dean/courses?limit=20&search=constitutional
```

#### Response (200)
```json
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": [
    {
      "_id": "course-id",
      "lecturerId": {
        "_id": "lecturer-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@university.edu",
        "profilePicture": "url"
      },
      "title": "Constitutional Law",
      "courseCode": "LAW301",
      "category": "Public Law",
      "level": "300",
      "institution": "University of Lagos",
      "description": "Course description",
      "courseImageUrl": "url",
      "enrolledStudents": 45,
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-01-15T08:00:00.000Z"
    }
  ],
  "totalStudents": 1200,
  "totalCourses": 120,
  "nextCursor": "next-cursor-value",
  "hasMore": true
}
```

#### Response Fields
- `enrolledStudents`: Number of approved enrollments per course
- `totalStudents`: Total students in the system
- `totalCourses`: Total courses in the dean's university

---

### 3. Fetch Enrollments
**GET** `/api/v1/Dean/enrollments`

Retrieves all enrollments for courses in the dean's university.

#### Query Parameters
- `limit` (number, optional): Results per page (default: 25)
- `cursor` (string, optional): Pagination cursor
- `status` (string, optional): Filter by status - "pending", "approved", or "rejected"

#### Example Request
```
GET /api/v1/Dean/enrollments?status=pending&limit=15
```

#### Response (200)
```json
{
  "success": true,
  "message": "Enrollments fetched successfully",
  "data": [
    {
      "_id": "enrollment-id",
      "userId": {
        "_id": "student-id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@student.edu"
      },
      "course": {
        "_id": "course-id",
        "title": "Constitutional Law",
        "courseCode": "LAW301",
        "category": "Public Law",
        "level": "300"
      },
      "status": "pending",
      "createdAt": "2026-03-15T08:00:00.000Z",
      "updatedAt": "2026-03-15T08:00:00.000Z"
    }
  ],
  "totalItems": 350,
  "nextCursor": "next-cursor-value",
  "hasMore": true
}
```

#### Status Values
- `pending`: Awaiting approval
- `approved`: Enrollment confirmed
- `rejected`: Enrollment denied

---

### 4. Fetch All Batches
**GET** `/api/v1/Dean/batches`

Retrieves all batches created by lecturers in the dean's university.

#### Query Parameters
- `limit` (number, optional): Results per page (default: 25)
- `cursor` (string, optional): Pagination cursor
- `order` (string, optional): Sort order - "asc" or "desc" (default: "desc")
- `batchYear` (string, optional): Filter by year
- `batchName` (string, optional): Filter by name

#### Example Request
```
GET /api/v1/Dean/batches?batchYear=2020&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "total": 85,
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

#### Response Fields
- `total`: Total count of batches in the university
- Only batches from lecturers in the dean's university are returned

---

### 5. Get Single Batch
**GET** `/api/v1/Dean/batches/:id`

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

#### Error Response (403)
```json
{
  "success": false,
  "message": "Access denied. Batch does not belong to your university."
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
- Validates that the batch belongs to a lecturer in the dean's university
- Returns complete student list for the batch

---

## University-Based Filtering

All dean endpoints implement university-based filtering:

### How It Works
1. Dean's university is extracted from `req.userInfo.university`
2. System queries for lecturers with matching university
3. Data is filtered to only include records from those lecturers

### Example Flow
```javascript
// Dean at "University of Lagos"
1. Get all lecturers where university = "University of Lagos"
2. Extract lecturer IDs
3. Filter courses/batches where lecturerId in [lecturer IDs]
4. Return filtered results
```

---

## Middleware

### deanMiddleware
Located at: `src/middleware/deanMiddleware.js`

**Functionality:**
- Validates user role is `dean` or `viceDean`
- Attaches user's university to `req.userInfo.university`
- Returns 403 error for unauthorized roles

**Usage:**
```javascript
router.get("/endpoint", authMiddleware, deanMiddleware, apiLimiter, handler);
```

---

## Database Indexes

### User Model (for lecturers)
- `{ role: 1 }` - Role filtering
- `{ role: 1, _id: -1 }` - Pagination
- `{ email: "text", firstName: "text", lastName: "text" }` - Search

### Course Model
- `{ lecturerId: 1, _id: -1 }` - Lecturer filtering
- `{ title: "text", courseCode: "text", category: "text" }` - Search

### Batch Model
- `{ userId: 1, batchYear: 1 }` - Year filtering
- `{ userId: 1, batchName: 1 }` - Name filtering
- `{ userId: 1, _id: -1 }` - Pagination

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Dean or Vice Dean privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Use Cases

### Dashboard Overview
```javascript
// Get summary statistics
GET /api/v1/Dean/lecturers?limit=1  // Check totalLecturers
GET /api/v1/Dean/courses?limit=1    // Check totalCourses
GET /api/v1/Dean/batches?limit=1    // Check total batches
```

### Search Functionality
```javascript
// Search for lecturers
GET /api/v1/Dean/lecturers?search=john

// Search for courses
GET /api/v1/Dean/courses?search=constitutional
```

### Filter Enrollments
```javascript
// View pending enrollments
GET /api/v1/Dean/enrollments?status=pending

// View approved enrollments
GET /api/v1/Dean/enrollments?status=approved
```

### Monitor Batches
```javascript
// View all 2020 batches
GET /api/v1/Dean/batches?batchYear=2020

// Get specific batch details
GET /api/v1/Dean/batches/batch-id
```

---

## Security Considerations

1. **University Isolation**: Deans cannot access data from other universities
2. **Role-Based Access**: Only `dean` and `viceDean` roles have access
3. **Data Validation**: All queries validate university ownership
4. **Rate Limiting**: API limiter applied to all endpoints
5. **Authentication**: All endpoints require valid JWT token
