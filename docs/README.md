# LexGo API Documentation

**API Version:** 1.0  
**Last Updated:** January 2026

---

## 📖 Overview

Welcome to the LexGo API documentation. LexGo is a legal education platform featuring AI-powered course material generation, personal note-taking, and a structured learning environment for students and lecturers.

---

## 📂 Documentation Structure

This documentation is organized by user roles and functional modules:

### 1. 🔐 Authentication & Security
- **[Authentication API](./auth/index.md)** - Registration, Login, OTP, and Token management.
- **[Common Reference](./general/common.md)** - Error formats, Cookies, and Best practices.

### 2. 👨‍🏫 Lecturer Modules
- **[Course Management](./lecturer/courses.md)** - Creating courses, uploading resources, and AI material generation.
- **[Quiz System](./lecturer/quizzes.md)** - Creating manual and AI-generated quizzes.
- **[Case Management](./lecturer/cases.md)** - Managing legal cases within courses.
- **[Sub-Lecturer System](./lecturer/sub-lecturers.md)** - Delegating course management to other lecturers.

### 3. 👨‍🎓 Student Modules
- **[AI Tools](./user/ai.md)** - Interacting with AI for legal questions.
- **[Notes Management](./user/notes.md)** - Creating and managing personal study notes.
- **[Enrollment system](./user/enrollment.md)** - Applying for courses and viewing enrolled content.
- **[Quizzes](./user/quizzes.md)** - Participating in AI and Lecturer-created quizzes.

### 4. 🛠️ Administrative Modules
- **[User Management](./admin/users.md)** - Fetching and managing user accounts.
- **[Global Cases](./admin/cases.md)** - Managing the global legal case database.

---

## 🚀 Quick Start

### 1. Base URL
`http://localhost:3000/api` (Local Development)

### 2. Authentication Flow
All protected endpoints require an `accessToken` in the `Authorization` header:
```http
Authorization: Bearer <accessToken>
```
The `accessToken` expires every 15 minutes. Use the `refreshToken` (stored in an HttpOnly cookie) to get a new one via `POST /api/Auth/refresh-token`.

---

## ⚡ Rate Limiting

To ensure stability, the following rate limits are applied:

| Endpoint Group | Limit | Window |
| :--- | :--- | :--- |
| **Login** | 3 requests | 15 minutes |
| **OTP/Password Reset** | 3 requests | 15 minutes |
| **AI Interactions** | 20 requests | 15 minutes |
| **General API** | 100 requests | 15 minutes |

---

## 📊 Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

**See the [Common Reference](./general/common.md) for more details on error handling.**
