# Sub-Lecturer API Documentation

**Base URL:** `/api/SubLecturer`
**Version:** 1.0

---

## Overview

The Sub-Lecturer system allows a Course Owner (Lecturer) to delegate management tasks to other Lecturers. A Sub-Lecturer can perform most actions (uploading resources, creating quizzes, managing cases) but cannot perform high-level administrative tasks like deleting the course or managing student enrollment requests.

---

## 1. Request to become a Sub-Lecturer

A Lecturer can request to be a sub-lecturer for a specific course.

**Endpoint:** `POST /api/SubLecturer/request/:courseId`
**Access:** Private (Authenticated Lecturers only)

- **Path Parameters**:
  - `courseId` (string): The ID of the course.
- **Responses**:
  - `201 Created`: Request submitted successfully.
  - `400 Bad Request`: Already the owner, or request already exists.
  - `404 Not Found`: Course does not exist.

---

## 2. Get Pending Requests

The course owner can fetch all pending sub-lecturer requests for their course.

**Endpoint:** `GET /api/SubLecturer/requests/:courseId`
**Access:** Private (Course Owner only)

- **Success Response (200)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "64...",
        "lecturerId": {
          "_id": "64...",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "status": "pending"
      }
    ]
  }
  ```

---

## 3. Handle Sub-Lecturer Request

The course owner can approve or reject a pending request.

**Endpoint:** `PATCH /api/SubLecturer/request/:courseId/:lecturerId`
**Access:** Private (Course Owner only)

- **Request Body**:
  ```json
  {
    "action": "approve" // Must be "approve" or "reject"
  }
  ```
- **Responses**:
  - `200 OK`: Request handled successfully.
  - `400 Bad Request`: Invalid action or request not found.

---

## 4. Get Approved Sub-Lecturers

Fetch a list of all approved sub-lecturers for a specific course.

**Endpoint:** `GET /api/SubLecturer/:courseId`
**Access:** Private (Course Owner only)

- **Success Response (200)**: returns list of approved sub-lecturers.

---

## 5. Remove Sub-Lecturer

Remove an approved sub-lecturer from a course.

**Endpoint:** `DELETE /api/SubLecturer/:courseId/:lecturerId`
**Access:** Private (Course Owner only)

- **Responses**:
  - `200 OK`: Sub-lecturer removed successfully.
  - `404 Not Found`: Record not found.

---

## Permissions Summary

| Action | Course Owner | Sub-Lecturer |
| :--- | :---: | :---: |
| View Course Content | ✅ | ✅ |
| Upload Resources | ✅ | ✅ |
| Create Quizzes | ✅ | ✅ |
| Create Cases | ✅ | ✅ |
| View Enrolled Students | ✅ | ✅ |
| **Manage Enrollments (Approve/Reject)** | ✅ | ❌ |
| **Manage Sub-Lecturers** | ✅ | ❌ |
| **Delete Course** | ✅ | ❌ |
| **Update Course Details** | ✅ | ❌ |

---

## 🔗 Related Documentation
- [Course Management API](./courses.md)
- [Lecturer Quiz API](./quizzes.md)
- [Lecturer Cases API](./cases.md)
