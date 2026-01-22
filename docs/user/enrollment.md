# Course Enrollment API Documentation

**Base URL:** `/api/Enrollments`  
**Version:** 1.0

---

## Overview

The Enrollment API manages the relationship between Students and Courses. Students can apply to join private courses using a secret code, and Lecturers (Course Owners) can review and manage these applications.

---

## 👨‍🎓 Student Endpoints

### 1. Apply for a Course
Submit a request to enroll in a specific course.

- **Endpoint**: `POST /api/Enrollments/apply/:courseId`
- **Auth**: Required (Bearer Token)
- **Path Parameters**:
  - `courseId` (string): The ID of the course you want to join.
- **Request Body**:
  ```json
  {
    "courseCode": "12345789"  // Required: The unique code shared by the lecturer
  }
  ```
- **Responses**:
  - `201 Created`: Application submitted successfully.
  - `400 Bad Request`: Incorrect course code or already applied.
  - `404 Not Found`: Course not found.

---

### 2. Get My Enrolled Courses
View all courses where your enrollment request has been **approved**.

- **Endpoint**: `GET /api/Enrollments/my-courses`
- **Auth**: Required (Bearer Token)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "64...",
        "title": "Introduction to Law",
        "courseCode": "LAW101",
        "institution": "University of Ghana",
        "level": "100"
      }
    ]
  }
  ```

---

## 👨‍🏫 Lecturer Endpoints

### 3. Get Pending Requests
View all students waiting for approval to join a specific course.

- **Endpoint**: `GET /api/Enrollments/requests/:courseId/pending`
- **Auth**: Required (Course Owner only)
- **Path Parameters**:
  - `courseId` (string): The ID of the course to check.
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "64... (Enrollment ID)",
        "userId": {
          "_id": "64...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "status": "pending",
        "createdAt": "2024..."
      }
    ]
  }
  ```

---

### 4. Approve or Reject Student
Decide whether to let a student into your course.

- **Endpoint**: `PATCH /api/Enrollments/requests/:courseId/:userId`
- **Auth**: Required (Course Owner only)
- **Path Parameters**:
  - `courseId` (string): The ID of the course.
  - `userId` (string): The ID of the student you are approving/rejecting.
- **Request Body**:
  ```json
  {
    "action": "approve" // Must be "approve" or "reject"
  }
  ```
- **Responses**:
  - `200 OK`: Student status updated successfully.
  - `400 Bad Request`: Invalid action or student never applied.
  - `403 Forbidden`: Not the course owner.

---

## 🔗 Related Documentation
- [Course Management API](../lecturer/courses.md)
- [Authentication API](../auth/index.md)
- [Common Reference](../general/common.md)
