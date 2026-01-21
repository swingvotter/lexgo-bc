# LexGo API Documentation

**API Version:** 1.0  
**Last Updated:** December 2024

---

## Overview

Welcome to the LexGo API documentation. This API provides endpoints for authentication, user management, AI interactions, notes management, and administrative functions.

## Base URLs

- **Auth API:** `/api/Auth`
- **AI API:** `/api/AI`
- **Admin API:** `/api/Admin`
- **Notes API:** `/api/Notes`

## Documentation Structure

This documentation is organized into separate files for easier navigation:

1. **[Authentication API](./auth.md)** - User registration, login, logout, password reset, and token management
2. **[AI API](./ai.md)** - AI interaction endpoints
3. **[Admin API](./admin.md)** - Administrative endpoints for user management
4. **[Notes API](./notes.md)** - Create, read, update, and delete personal notes
5. **[Cases API](./cases.md)** - Manage and search legal cases
6. **[Common Reference](./common.md)** - Error handling, cookies, rate limiting, and frontend implementation tips


## Quick Start

### 1. Authentication Flow

```
Register → Login → Get Access Token → Use in API Requests
```

### 2. Making Authenticated Requests

All protected endpoints require an `accessToken` in the Authorization header:

```http
Authorization: Bearer <accessToken>
```

### 3. Cookie Handling

The API uses HttpOnly cookies for security. Ensure your frontend sends cookies with requests:

```javascript
// Axios example
const api = axios.create({
  baseURL: 'https://your-api.com',
  withCredentials: true  // Required for cookies
});
```

## Rate Limiting

Different endpoints have different rate limits:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Login | 3 requests | 15 minutes |
| OTP Operations | 3 requests | 15 minutes |
| AI Requests | 20 requests | 15 minutes |
| General API | 100 requests | 15 minutes | Notes API endpoints |

## Authentication

Most endpoints require authentication. The authentication flow:

1. User logs in → receives `accessToken` (expires in 15 minutes)
2. `refreshToken` stored as HttpOnly cookie (expires in 7 days)
3. When `accessToken` expires → use `/api/Auth/refresh-token` to get new token
4. Include `accessToken` in `Authorization` header for protected routes

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials or token |
| 403 | Forbidden - Valid token but no access |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error |

## Getting Started

1. Start with [Authentication API](./auth.md) to register and login
2. Review [Common Reference](./common.md) for error handling and best practices
3. Explore [AI API](./ai.md) for AI interactions
4. Use [Notes API](./notes.md) to manage personal notes
5. Check [Admin API](./admin.md) for administrative functions (admin only)

---

**Need Help?** Contact the Backend Team

