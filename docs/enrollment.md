# Enrollment API Documentation

This documentation outlines the endpoints for managing course enrollments in LexGo.

## Base URL
`http://localhost:3000/api/Enrollments`

---

## 👨‍🎓 Student Endpoints

### 1. Apply for a Course
Submit a request to enroll in a specific course.

- **Endpoint**: `POST /apply/:courseId`
- **Auth**: Required
- **Path Parameters**:
  - `courseId` (string): The ID of the course you want to join.
- **Body**:
  ```json
  {
    "courseCode": "12345789" // Required: Must match the course's secret code
  }
  ```

### 2. Get My Enrolled Courses
View all courses where your enrollment request has been **approved**.

- **Endpoint**: `GET /my-courses`
- **Auth**: Required
- **Body**: None
- **Response**: Returns a list of course details (Title, Code, Institution, etc.).

---

## 👨‍🏫 Lecturer Endpoints

### 3. Get Pending Requests
View all students waiting for approval to join your specific course.

- **Endpoint**: `GET /requests/:courseId/pending`
- **Auth**: Required (Must be the course creator)
- **Path Parameters**:
  - `courseId` (string): The ID of the course to check.
- **Body**: None

### 4. Approve or Reject Student
Decide whether to let a student into your course.

- **Endpoint**: `PATCH /requests/:courseId/:userId`
- **Auth**: Required (Must be the course creator)
- **Path Parameters**:
  - `courseId` (string): The ID of the course.
  - `userId` (string): The ID of the student you are approving/rejecting.
- **Body**:
  ```json
  {
    "action": "approve" // Options: "approve" or "reject"
  }
  ```
