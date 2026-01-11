# Lecturer Quiz Creation Documentation

## 1. Manual Creation
**Endpoint:** `/api/LecturerQuiz/create/manual`
**Method:** `POST`
**Content-Type:** `multipart/form-data` or `application/json` (No file upload needed, butFormData is often used in the frontend)
**Access:** Private (Lecturer Only)

### Required Body Parameters
| Field Name | Type | Description |
|---|---|---|
| `courseId` | String | The ID of the course. |
| `title` | String | Quiz title. |
| `description` | String | Quiz instructions/description. |
| `quizDuration` | Number | Duration in minutes. |
| `quizStartTime` | Date | Start time. |
| `quizEndTime` | Date | End time. |
| `attempts` | Number | Max attempts (`-1` for unlimited). |
| `grade` | JSON | Grading config (e.g., `{"markPerQuestion": 1, "totalMarks": 10}`). |
| `questions` | JSON | **Required**. Array of question objects. |

### Optional Body Parameters
| Field Name | Type | Description |
|---|---|---|
| `shuffleQuestions` | Boolean | Randomize question order. |
| `shuffleAnswers` | Boolean | Randomize answer order. |
| `showScoresImmediately` | Boolean | Show results immediately. |

---

## 2. Automatic (Document) Creation
**Endpoint:** `/api/LecturerQuiz/create/auto`
**Method:** `POST`
**Content-Type:** `multipart/form-data` (**Required**)
**Access:** Private (Lecturer Only)

### Required Body Parameters
| Field Name | Type | Description |
|---|---|---|
| `courseId` | String | The ID of the course. |
| `title` | String | Quiz title. |
| `description` | String | Quiz instructions/description. |
| `quizDuration` | Number | Duration in minutes. |
| `quizStartTime` | Date | Start time. |
| `quizEndTime` | Date | End time. |
| `attempts` | Number | Max attempts (`-1` for unlimited). |
| `grade` | JSON | Grading config. |
| `file` | File | **Required**. The PDF or DOCX file to generate from. |

### Optional Body Parameters
| Field Name | Type | Description |
|---|---|---|
| `numberOfQuestions` | Number | Target number of questions (Default: 10). |
| `difficultyLevel` | String | "Easy", "Medium", "Hard", or "Mixed". |
| `shuffleQuestions` | Boolean | Randomize question order. |
| `shuffleAnswers` | Boolean | Randomize answer order. |
| `showScoresImmediately` | Boolean | Show results immediately. |

### Response (Auto)
Returns `202 Accepted` immediately. The quiz is generated in the background.
```json
{
  "success": true,
  "message": "Quiz creation started. Processing document...",
  "quizId": "...",
  "jobId": "..."
}
```
