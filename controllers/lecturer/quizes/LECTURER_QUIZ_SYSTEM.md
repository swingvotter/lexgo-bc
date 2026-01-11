# Lecturer Quiz System Documentation

This document provides a comprehensive guide to the Lecturer Quiz system, including endpoints for both Lecturers and Students, required fields, and the business logic governing participation.

---

## 1. Overview
The system allows lecturers to create quizzes (Manual or AI-Generated), manage them, and allows enrolled students to take them within a specific timeframe. 

### Key Business Logic:
- **Flexible Timing**: The `quizEndTime` can be provided manually. If omitted, it is automatically calculated as `quizStartTime` + `quizDuration`.
- **Security**: Students fetching a quiz will NOT receive the `correctAnswer` or `explanation` fields.
- **Participation**: Students must be **Enrolled** (status: `approved`) and must be within the **Timing Window** and **Attempt Limit**.
- **Grading**: Grading happens server-side upon submission.

---

## 2. Lecturer Endpoints
**Base URL:** `/api/LecturerQuiz`

### A. Create Quiz (Manual)
Create a quiz by providing all questions and answers.
- **Method:** `POST`
- **Path:** `/create/manual`
- **Required Body Fields:**
    - `courseId`: (String) MongoDB ID of the course.
    - `title`: (String) Quiz title.
    - `description`: (String) Quiz instructions.
    - `quizDuration`: (Number) Duration in minutes.
    - `quizStartTime`: (Date String) e.g., `"2026-02-01T10:00:00Z"`.
    - `attempts`: (Number) Max attempts per student (`1`, `2`, `3` or `-1` for unlimited).
    - `grade`: (JSON Object) `{"markPerQuestion": 1, "totalMarks": 10}`.
    - `questions`: (JSON Array) Array of objects:
        - `question`: (String)
        - `options`: (Array of Strings)
        - `correctAnswer`: (String) Must match one of the options.
        - `explanation`: (String) Optional.

### B. Create Quiz (Automatic/AI)
Create a quiz by uploading a document (PDF/Word). The system extracts text and generates questions via AI.
- **Method:** `POST`
- **Path:** `/create/auto`
- **Content-Type:** `multipart/form-data`
- **Required Fields:**
    - `file`: (File) The document.
    - `courseId`, `title`, `description`, `quizDuration`, `quizStartTime`, `attempts`, `grade`: (Same as Manual).
    - `numberOfQuestions`: (Number) How many questions to generate (Default: 10).
    - `difficultyLevel`: (String) "Easy", "Medium", "Hard", or "Mixed".

### C. Management Endpoints
- **Get Course Quizzes**: `GET /course/:courseId`
    - Returns all quizzes attached to a specific course.
- **Get My Quizzes**: `GET /my-quizzes`
    - Returns quizzes created by the logged-in lecturer (Paginated).
- **Delete Quiz**: `DELETE /:quizId`
    - Permanently deletes the quiz.

---

## 3. Student Endpoints
**Base URL:** `/api/StudentQuiz`

### A. Get Quiz Details
Fetch the quiz content to start the attempt.
- **Method:** `GET`
- **Path:** `/:quizId`
- **Logic**: 
    - Checks if student is enrolled in the course.
    - Checks if current time is between `startTime` and `endTime`.
    - Checks if student has attempts remaining.
- **Response**: Returns quiz metadata and questions (Options are included, but `correctAnswer` is stripped).

### B. Submit Quiz
Submit answers for grading.
- **Method:** `POST`
- **Path:** `/:quizId/submit`
- **Required Body Fields:**
    - `answers`: (Array) Array of objects:
        - `questionId`: (String) The `_id` of the question.
        - `selectedOption`: (String) The text of the chosen option.
- **Logic**: 
    - Server verifies timing and attempts again.
    - Compares answers with database records.
    - Calculates score.
    - Creates a `LecturerQuizSubmission` record.

---

## 4. Database Models Reference

### LecturerQuiz (`models/lecturer/quizes.js`)
Stores the quiz configuration and all questions/answers.


### LecturerQuizSubmission (`models/users/lecturerQuizSubmission.Model.js`)
Stores the results of every attempt made by a student.
- `score`: Total marks achieved.
- `attemptNumber`: (1, 2, 3...) tracked per student per quiz.
- `answers`: Stores what the student picked and if it was correct.

---

## 5. Error Codes to Watch
- `403 Forbidden`: Student is not enrolled, or quiz has not started, or quiz has ended, or max attempts reached.
- `404 Not Found`: Quiz ID does not exist.
- `400 Bad Request`: Missing required fields (e.g., no `courseId`).
