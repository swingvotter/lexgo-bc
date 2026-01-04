# Quiz API Documentation

**Base URL:** `/api/Ai`  
**Authentication:** Required for all endpoints (Bearer token in Authorization header)

---

## Endpoints

### 1. Create Quiz

Generates a new quiz asynchronously. Returns a `jobId` to track quiz generation status.

**Endpoint:** `POST /api/Ai/quiz`

**Request Body:**
```json
{
  "topic": "string (required)",
  "difficultyLevel": "easy | medium | hard (required)",
  "numberOfQuiz": "number (required)"
}
```

**Response (202 Accepted):**
```json
{
  "message": "Quiz generation started",
  "jobId": "string",
  "status": "processing"
}
```

**Error Responses:**
- `400` - Missing required fields: `topic`, `difficultyLevel`, or `numberOfQuiz`
- `500` - Server error

---

### 2. Get Quiz Status

Check the status of quiz generation using the `jobId` from create quiz endpoint.

**Endpoint:** `GET /api/Ai/quiz/status/:jobId`

**URL Parameters:**
- `jobId` (required) - Job ID returned from create quiz endpoint

**Response (200 OK):**

*While processing:*
```json
{
  "status": "waiting | active | delayed",
  "progress": "number",
  "message": "Quiz generation in progress"
}
```

*When completed:*
```json
{
  "status": "completed",
  "quizId": "string",
  "quiz": { /* quiz object */ }
}
```

*When failed:*
```json
{
  "status": "failed",
  "message": "error message"
}
```

**Error Responses:**
- `400` - Missing `jobId`
- `404` - Job not found
- `500` - Server error

---

### 3. Get Quiz

Retrieve a specific quiz by ID.

**Endpoint:** `GET /api/Ai/quiz/:quizId`

**URL Parameters:**
- `quizId` (required) - Quiz ID

**Response (200 OK):**
```json
{
  "message": "Quiz retrieved successfully",
  "quiz": {
    "_id": "string",
    "userId": "string",
    "topic": "string",
    "difficultyLevel": "easy | medium | hard",
    "totalQuestions": "number",
    "questions": [
      {
        "question": "string",
        "options": ["string"],
        "correctAnswer": "string"
      }
    ],
    "score": "number",
    "completed": "boolean",
    "totalQuizzes": "number",
    "totalQuizzesScores": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- `400` - Missing `quizId`
- `404` - Quiz not found or access denied
- `500` - Server error

---

### 4. Get All Quizzes

Retrieve all quizzes for the authenticated user with pagination and optional filters.

**Endpoint:** `GET /api/Ai/quizzes`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `completed` (optional) - Filter by completion status: `true` or `false`
- `difficultyLevel` (optional) - Filter by difficulty: `easy`, `medium`, or `hard`

**Example:** `GET /api/Ai/quizzes?page=1&limit=10&completed=false&difficultyLevel=easy`

**Response (200 OK):**
```json
{
  "message": "Quizzes retrieved successfully",
  "quizzes": [ /* array of quiz objects */ ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "totalItems": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean",
    "startIndex": "number",
    "endIndex": "number"
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 5. Submit Quiz Score

Submit the score for a completed quiz. This marks the quiz as completed and calculates overall statistics.

**Endpoint:** `POST /api/Ai/quiz/submit/:quizId`

**URL Parameters:**
- `quizId` (required) - Quiz ID

**Request Body:**
```json
{
  "score": "number (required, non-negative)"
}
```

**Response (200 OK):**
```json
{
  "message": "Quiz score submitted successfully",
  "quiz": {
    "quizId": "string",
    "score": "number",
    "totalQuizzes": "number",
    "totalQuizzesScores": "number"
  }
}
```

**Error Responses:**
- `400` - Missing `quizId` or `score`, score must be non-negative number, quiz already completed, or score exceeds total questions
- `404` - Quiz not found or access denied
- `500` - Server error

---

### 6. Delete Quiz

Delete a quiz by ID.

**Endpoint:** `DELETE /api/Ai/quiz/:quizId`

**URL Parameters:**
- `quizId` (required) - Quiz ID

**Response (200 OK):**
```json
{
  "message": "Quiz deleted successfully"
}
```

**Error Responses:**
- `400` - Missing `quizId`
- `401` - Unauthorized
- `404` - Quiz not found or access denied
- `500` - Server error

---

## Quiz Object Structure

```json
{
  "_id": "string (UUID)",
  "userId": "string (ObjectId)",
  "topic": "string",
  "difficultyLevel": "easy | medium | hard",
  "totalQuestions": "number",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string"
    }
  ],
  "score": "number (default: 0)",
  "completed": "boolean (default: false)",
  "totalQuizzes": "number (calculated after submission)",
  "totalQuizzesScores": "number (average percentage, calculated after submission)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

---

## Workflow

1. **Create Quiz** → Returns `jobId`
2. **Poll Quiz Status** → Use `jobId` to check if quiz is ready
3. **Get Quiz** → Once status is "completed", use `quizId` to retrieve full quiz
4. **Submit Score** → After user completes quiz, submit their score
5. **Get All Quizzes** → View user's quiz history
6. **Delete Quiz** → Remove a quiz if needed

---

## Important Notes

- All endpoints require authentication (Bearer token)
- Quiz generation is asynchronous - use status endpoint to check progress
- `score` cannot exceed `totalQuestions` when submitting
- A quiz can only be submitted once (check `completed` field)
- `totalQuizzesScores` is the average percentage across all completed quizzes



