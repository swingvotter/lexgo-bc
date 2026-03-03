# Lecturer Quiz System Documentation

**Base URL:** `/api/v1/LecturerQuiz`
**Version:** 1.0

---

## 1. Overview
The system allows lecturers and approved sub-lecturers to create, schedule, and manage quizzes. Students can participate in these quizzes if they are enrolled in the course and within the designated time window.

### Access Levels
- **Course Owner**: Full control (Create, View, Delete).
- **Sub-Lecturer**: Can create quizzes and view results. Cannot delete quizzes created by others (implied by owner check).
- **Student**: Can only view quiz content to participate and submit answers.

---

## 2. Create Quiz (Manual)

**Endpoint:** `POST /api/LecturerQuiz/create/manual`
**Access:** Private (Course Owner or Approved Sub-Lecturer)

### Request Body
```json
{
  "courseId": "string (required)",
  "title": "string (required)",
  "description": "string (required)",
  "quizDuration": "number (minutes, required)",
  "quizStartTime": "Date String (required)",
  "quizEndTime": "Date String (optional)",
  "attempts": "1 | 2 | 3 | -1 (unlimited, required)",
  "grade": { "markPerQuestion": 1, "totalMarks": 10 },
  "shuffleQuestions": "boolean",
  "shuffleAnswers": "boolean",
  "showScoresImmediately": "boolean",
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string",
      "explanation": "string (optional)",
      "mark": "number (optional, default 1)"
    }
  ]
}
```

### Automatic Timing Logic
- If `quizStartTime` is in the past or invalid, it is set to `now`.
- If `quizEndTime` is provided and valid, it is used.
- If `quizEndTime` is omitted or invalid, the system automatically sets it to `quizStartTime + quizDuration`.

---

## 3. Create Quiz (Automatic/AI)

**Endpoint:** `POST /api/LecturerQuiz/create/auto`  
**Content-Type:** `multipart/form-data`  
**Access:** Private (Course Owner or Approved Sub-Lecturer)

Upload a PDF/DOCX to generate questions automatically using AI.

### Form Fields
- `file` (required): PDF/DOCX document.
- `courseId` (required)
- `title` (required)
- `description` (required)
- `quizDuration` (required, minutes)
- `quizStartTime` (required)
- `quizEndTime` (optional)
- `attempts` (required)
- `grade` (optional JSON)
- `shuffleQuestions` (optional boolean)
- `shuffleAnswers` (optional boolean)
- `showScoresImmediately` (optional boolean)
- `numberOfQuestions` (optional, defaults to 10)
- `difficultyLevel` (optional, defaults to "Mixed")

---

## 4. Management Endpoints

### A. Get Course Quizzes (Created by the current lecturer)
**Endpoint:** `GET /api/LecturerQuiz/course/:courseId`

**Query Parameters:**
- `limit` (optional, default 25)
- `cursor` (optional, for pagination)

### B. Get My Quizzes (Paginated)
**Endpoint:** `GET /api/LecturerQuiz/my-quizzes`

**Query Parameters:**
- `limit` (optional, default 25)
- `cursor` (optional, for pagination)

### C. Delete Quiz
**Endpoint:** `DELETE /api/LecturerQuiz/:quizId`
**Access:** Private (Only deletes quizzes created by the authenticated lecturer)

---

## 5. Participation (Student)

**Base URL:** `/api/StudentQuiz`

### A. Get Quiz Details
- **Endpoint:** `GET /api/StudentQuiz/:quizId`
- **Logic**: Verifies enrollment (`approved` status), current time window, and attempt limits.
- **Security**: Strips `correctAnswer` and `explanation` from the questions.

### B. Submit Quiz
- **Endpoint:** `POST /api/StudentQuiz/:quizId/submit`
- **Body**: `{ "answers": [{ "questionId": "...", "selectedOption": "..." }] }`
- **Logic**: Grades the attempt, saves a `LecturerQuizSubmission` record, and returns the score.
