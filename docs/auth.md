# Authentication API Documentation

**Base URL:** `/api/Auth`  
**Version:** 1.1

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

---

## 1. Register

Creates a new user account. Implements localized country detection and role-based validation.

**Endpoint:** `POST /api/Auth/register`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ Yes | User's first name (3-15 chars) |
| `lastName` | string | ✅ Yes | User's last name (3-15 chars) |
| `otherName` | string | ❌ No | User's other/middle name |
| `phoneNumber` | string | ✅ Yes | User's phone number (+ or digits, 10-15 chars) |
| `university` | string | ✅ Yes | User's university |
| `acadamicLevel`| string | ⚠️ Only Students | Required only if `role` is `student` |
| `program` | string | ⚠️ Only Students | Must be one of: `LL.B`, `LL.M`, `M.A`, `PFD`. Required only if `role` is `student` |
| `studentId` | string | ⚠️ Only Students | Required only if `role` is `student` (5-20 chars) |
| `email` | string | ✅ Yes | User's email address |
| `password` | string | ✅ Yes | Password (min 8 characters) |
| `confirmPassword` | string | ✅ Yes | Must match password |
| `role` | string | ❌ No | One of: `student`, `lecturer`, `admin`. Default: `student` |
| `detectedCountry` | string | ❌ No | Manually provide country or leave for auto-detection |

### Example Request (Student)

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
  "confirmPassword": "SecurePass123",
  "role": "student"
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
    "role": "student",
    "progress": {
      "lessonsCompleted": 0,
      "learningStreak": 1
    },
    "detectedCountry": "Ghana",
    "createdAt": "2024-12-01T00:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Validation failed` | Returns an `errors` array with field-specific messages |
| 409 | `A user with this Student ID already exists` | Conflict: studentId already taken |
| 409 | `A user with this email address already exists` | Conflict: email already taken |
| 409 | `A user with this phone number already exists` | Conflict: phoneNumber already taken |

---

## 2. Login

Authenticates user and returns access/refresh tokens as HttpOnly cookies. Updates login streak.

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
  "message": "user login successfully"
}
```

### Cookies Set

| Cookie | HttpOnly | Expiry | Description |
|--------|----------|--------|-------------|
| `accessToken` | ✅ Yes | 15 mins | JWT access token |
| `refreshToken` | ✅ Yes | 7 days | JWT refresh token for session maintenance |

### Rate Limiting

- **Limit:** 3 requests per 15 minutes
- **Response:** `429 Too Many Requests` if exceeded

### Error Responses

| Status | Message | Doc Hint |
|--------|---------|----------|
| 400 | `invalid fields` | `make sure all fields are correctly spelt and included` |
| 401 | `wrong credentails` | `meaning user has not registred or wrong credentials` |

### Frontend Notes

- **Credentials:** Set `withCredentials: true` in your Axios/Fetch config to allow cookie handling.
- **Tokens:** You no longer need to store tokens in localStorage. The browser handles them automatically.
- **Auto-Detection:** The server uses GeoIP to detect the user's country on login and registration.

---

## 3. Logout

Logs out the user and clears all tokens.

**Endpoint:** `POST /api/Auth/logout`

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

---

### 4.2 Verify OTP

Verifies the 4-digit OTP code sent to email.

**Endpoint:** `POST /api/Auth/verify-otp`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `otpCode` | string | ✅ Yes | 4-digit OTP from email |

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
| 400 | `invalid token.` |
| 400 | `OTP code is required` |
| 400 | `OTP has expired.` |
| 400 | `Invalid OTP code. Please try again.` |

---

### 4.3 Reset Password

Sets a new password after OTP verification.

**Endpoint:** `PATCH /api/Auth/reset-password`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | ✅ Yes | New password |
| `confirmPassword` | string | ✅ Yes | Must match password |

### Success Response (200)

```json
{
  "success": true,
  "message": "password reset successfully"
}
```

### Cookies Cleared

- `otpCodeToken`

---

## 5. Refresh Token

Gets a new set of access and refresh tokens using token rotation.

**Endpoint:** `POST /api/Auth/refresh-token`

### Cookies Required

| Cookie | Description |
|--------|-------------|
| `refreshToken` | Set during login |

### Success Response (200)

```json
{
  "success": true,
  "message": "token refreshed successfully"
}
```

### Cookies Updated (Rotation)

| Cookie | Description |
|--------|-------------|
| `accessToken` | New short-lived access token |
| `refreshToken` | New refresh token (replaces the old one) |

---

## Password Reset Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. POST /api/Auth/send-otp                                      │
│     Body: { "email": "user@example.com" }                        │
│     → Sets otpCodeToken cookie                                    │
│     → Sends 4-digit OTP to email                                 │
│                                                                   │
│                         ↓                                         │
│                                                                   │
│  2. POST /api/Auth/verify-otp                                    │
│     Body: { "otpCode": "1234" }                                  │
│     Cookie: otpCodeToken (auto-sent)                              │
│     → Verifies OTP                                               │
│     → Sets isVerified flag in DB                                 │
│                                                                   │
│                         ↓                                         │
│                                                                   │
│  3. PATCH /api/Auth/reset-password                               │
│     Body: { "password": "new", "confirmPassword": "new" }         │
│     Cookie: otpCodeToken (auto-sent)                              │
│     → Updates password                                            │
│     → Clears otpCodeToken cookie                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

**See also:** [Common Reference](./common.md) for global error handling and frontend implementation tips.
