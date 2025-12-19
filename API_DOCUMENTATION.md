# LexGo Authentication API Documentation

**Base URL:** `/api/Auth`  
**Version:** 1.0  
**Last Updated:** December 2024

---

## Table of Contents
1. [Register](#1-register)
2. [Login](#2-login)
3. [Logout](#3-logout)
4. [Password Reset Flow](#4-password-reset-flow)
   - [Send OTP](#41-send-otp)
   - [Verify OTP](#42-verify-otp)
   - [Reset Password](#43-reset-password)
5. [Refresh Token](#5-refresh-token)
6. [Cookies Reference](#6-cookies-reference)
7. [Error Handling](#7-error-handling)

---

## 1. Register

Creates a new user account.

**Endpoint:** `POST /api/Auth/register`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ Yes | User's first name |
| `lastName` | string | ✅ Yes | User's last name |
| `otherName` | string | ❌ No | User's other/middle name |
| `phoneNumber` | string | ✅ Yes | User's phone number |
| `university` | string | ✅ Yes | User's university |
| `acadamicLevel` | string | ✅ Yes | Academic level |
| `program` | string | ✅ Yes | Must be one of: `LL.B`, `LL.M`, `M.A`, `PFD` |
| `email` | string | ✅ Yes | User's email address |
| `studentId` | string | ✅ Yes | Student ID (required for students) |
| `password` | string | ✅ Yes | Password (min 8 characters recommended) |
| `confirmPassword` | string | ✅ Yes | Must match password |
| `role` | string | ❌ No | One of: `student`, `lecturer`, `admin`, `judge`, `lawyer`. Default: `student` |

### Example Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+233123456789",
  "university": "University of Ghana",
  "acadamicLevel": "Level 300",
  "program": "LL.B",
  "email": "john.doe@example.com",
  "studentId": "STU123456",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "account created successfully",
  "data": {
    "_id": "64a...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    // ... other user fields (password excluded)
  }
}
```

### Error Responses
| Status | Message |
|--------|---------|
| 400 | `invalid fields` - Missing required fields |
| 400 | `password do not match` |
| 400 | `user already exist` |

---

## 2. Login

Authenticates user and returns access token.

**Endpoint:** `POST /api/Auth/login`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | User's email |
| `password` | string | ✅ Yes | User's password |

### Example Request
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "user login successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Cookies Set
| Cookie | HttpOnly | Expiry |
|--------|----------|--------|
| `refreshToken` | ✅ Yes | 7 days |

### Error Responses
| Status | Message |
|--------|---------|
| 400 | `invalid fields` |
| 401 | `wrong credentails` |

### Frontend Notes
- Store the `accessToken` in memory (not localStorage for security)
- The `refreshToken` is automatically stored as an HttpOnly cookie
- Include `accessToken` in Authorization header: `Bearer <accessToken>`

---

## 3. Logout

Logs out the user and clears tokens.

**Endpoint:** `POST /api/Auth/logout`

### Request Body
None required.

### Cookies Required
| Cookie | Description |
|--------|-------------|
| `refreshToken` | Will be cleared on logout |

### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Cookies Cleared
- `refreshToken`
- `accessToken`

---

## 4. Password Reset Flow

Password reset requires 3 sequential steps:

```
Step 1: Send OTP → Step 2: Verify OTP → Step 3: Reset Password
```

### 4.1 Send OTP

Sends a 4-digit OTP to the user's email.

**Endpoint:** `POST /api/Auth/send-otp`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Registered email address |

### Example Request
```json
{
  "email": "john.doe@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "If an account exists, an OTP has been sent."
}
```

### Cookies Set
| Cookie | HttpOnly | Expiry | Description |
|--------|----------|--------|-------------|
| `otpCodeToken` | ✅ Yes | 15 minutes | Required for verify-otp and reset-password |

### Rate Limiting
This endpoint is rate-limited. Too many requests will return `429 Too Many Requests`.

---

### 4.2 Verify OTP

Verifies the 4-digit OTP code sent to email.

**Endpoint:** `POST /api/Auth/verify-otp`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `otpCode` | string | ✅ Yes | 4-digit OTP from email |

### Cookies Required
| Cookie | Description |
|--------|-------------|
| `otpCodeToken` | Set automatically by send-otp endpoint |

### Example Request
```json
{
  "otpCode": "1234"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "otp succesfully verified"
}
```

### Error Responses
| Status | Message |
|--------|---------|
| 400 | `invalid token.` - Cookie missing or invalid |
| 400 | `all fields is required` |
| 400 | `otp expired.` - OTP has expired (15 min limit) |
| 400 | `invalid token do not match.` - Wrong OTP code |

### Frontend Notes
- OTP expires after **15 minutes**
- After successful verification, proceed immediately to reset-password
- The `otpCodeToken` cookie is still needed for the reset-password step

---

### 4.3 Reset Password

Sets a new password after OTP verification.

**Endpoint:** `POST /api/Auth/reset-password`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | ✅ Yes | New password |
| `confirmPassword` | string | ✅ Yes | Must match password |

### Cookies Required
| Cookie | Description |
|--------|-------------|
| `otpCodeToken` | Set by send-otp, verified by verify-otp |

### Example Request
```json
{
  "password": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "password reset successfully"
}
```

### Cookies Cleared
- `otpCodeToken`

### Error Responses
| Status | Message |
|--------|---------|
| 400 | `All fields are required` |
| 400 | `Passwords do not match` |
| 401 | `user is not verified` - OTP not verified yet |
| 404 | `user not found` |

---

## 5. Refresh Token

Gets a new access token using the refresh token.

**Endpoint:** `POST /api/Auth/refresh-token`

### Request Headers
| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <accessToken>` | ✅ Yes |

### Cookies Required
| Cookie | Description |
|--------|-------------|
| `refreshToken` | Set during login |

### Success Response (200)
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Cookies Updated
| Cookie | Description |
|--------|-------------|
| `refreshToken` | New refresh token (token rotation) |

### Error Responses
| Status | Message |
|--------|---------|
| 401 | `refreshToken is missing` |
| 403 | `refreshToken does not exist` |

### Frontend Notes
- Call this endpoint when access token expires (15 min)
- Implement automatic token refresh on 401 responses
- The refresh token is rotated on each use for security

---

## 6. Cookies Reference

| Cookie Name | Set By | Cleared By | Expiry | Purpose |
|-------------|--------|------------|--------|---------|
| `refreshToken` | Login | Logout | 7 days | JWT refresh token |
| `otpCodeToken` | Send OTP | Reset Password | 15 min | Password reset verification |

### Cookie Settings (Production)
```javascript
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: "strict"   // CSRF protection
}
```

---

## 7. Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials or token |
| 403 | Forbidden - Valid token but no access |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error |

---

## Quick Reference: Complete Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. POST /api/Auth/send-otp                                     │
│     Body: { "email": "user@example.com" }                       │
│     → Sets otpCodeToken cookie                                  │
│     → Sends 4-digit OTP to email                                │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  2. POST /api/Auth/verify-otp                                   │
│     Body: { "otpCode": "1234" }                                 │
│     Cookie: otpCodeToken (auto-sent)                            │
│     → Verifies OTP                                              │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  3. POST /api/Auth/reset-password                               │
│     Body: { "password": "new", "confirmPassword": "new" }       │
│     Cookie: otpCodeToken (auto-sent)                            │
│     → Updates password                                          │
│     → Clears otpCodeToken cookie                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation Tips

### 1. Axios Configuration
```javascript
const api = axios.create({
  baseURL: 'https://your-api.com/api/Auth',
  withCredentials: true  // Required for cookies
});
```

### 2. Token Storage
```javascript
// Store access token in memory, not localStorage
let accessToken = null;

// Set after login
accessToken = response.data.accessToken;

// Use in requests
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

### 3. Auto Token Refresh
```javascript
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const { data } = await api.post('/refresh-token');
      accessToken = data.accessToken;
      error.config.headers['Authorization'] = `Bearer ${accessToken}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

**Document Created:** December 2024  
**API Version:** 1.0  
**Contact:** Backend Team

