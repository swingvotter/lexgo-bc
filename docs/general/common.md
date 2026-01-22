# Common Reference

This document contains common information applicable to all API endpoints.

---

## Table of Contents

1. [Error Handling](#1-error-handling)
2. [Cookies Reference](#2-cookies-reference)
3. [Rate Limiting](#3-rate-limiting)
4. [Authentication](#4-authentication)
5. [Frontend Implementation](#5-frontend-implementation)

---

## 1. Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully (e.g., registration) |
| 400 | Bad Request | Invalid input, missing required fields, validation errors |
| 401 | Unauthorized | Missing/invalid access token, expired token, wrong credentials |
| 403 | Forbidden | Valid token but insufficient permissions (e.g., not admin) |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Error Response Examples

#### 400 Bad Request
```json
{
  "success": false,
  "message": "invalid fields"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "accessToken is absent"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many login attempts. Try again in 15 minutes."
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to fetch users. Please try again later."
}
```

### Error Handling Best Practices

1. **Always check the `success` field** in responses
2. **Handle specific status codes** appropriately
3. **Show user-friendly messages** - don't expose technical details
4. **Implement retry logic** for 500 errors
5. **Handle rate limiting** by showing wait time
6. **Refresh tokens** automatically on 401 errors

---

## 2. Cookies Reference

The API uses HttpOnly cookies for security. Cookies are automatically sent with requests when `withCredentials: true` is set.

### Cookie List

| Cookie Name | Set By | Cleared By | Expiry | Purpose |
|-------------|--------|------------|--------|---------|
| `refreshToken` | Login | Logout | 7 days | JWT refresh token for token rotation |
| `otpCodeToken` | Send OTP | Reset Password | 15 minutes | Password reset verification token |

### Cookie Settings (Production)

```javascript
{
  httpOnly: true,      // Not accessible via JavaScript (security)
  secure: true,        // HTTPS only (production)
  sameSite: "strict"   // CSRF protection
}
```

### Cookie Handling in Frontend

Cookies are automatically managed by the browser. You just need to:

1. **Enable cookie sending:**
   ```javascript
   axios.defaults.withCredentials = true;
   // or per request
   axios.get('/api/endpoint', { withCredentials: true });
   ```

2. **Don't try to access cookies via JavaScript** - they're HttpOnly for security

3. **Handle cookie expiration** - implement token refresh logic

---

## 3. Rate Limiting

Different endpoints have different rate limits to prevent abuse and ensure fair usage.

### Rate Limit Table

| Endpoint Type | Limit | Window | Endpoints |
|--------------|-------|--------|-----------|
| Login | 3 requests | 15 minutes | `POST /api/Auth/login` |
| OTP Operations | 3 requests | 15 minutes | `POST /api/Auth/send-otp`, `POST /api/Auth/verify-otp`, `POST /api/Auth/reset-password` |
| AI Requests | 20 requests | 15 minutes | `POST /api/AI/ask-AI` |
| General API | 100 requests | 15 minutes | `GET /api/Admin/users`, Notes API endpoints, and other general endpoints |

### Rate Limit Response

When rate limit is exceeded:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "success": false,
  "message": "Too many login attempts. Try again in 15 minutes."
}
```

**Response Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1701234567
```

### Handling Rate Limits

```javascript
// Example: Handle rate limiting
try {
  const response = await api.post('/api/Auth/login', credentials);
} catch (error) {
  if (error.response?.status === 429) {
    const resetTime = error.response.headers['x-ratelimit-reset'];
    const waitTime = Math.ceil((resetTime * 1000 - Date.now()) / 1000 / 60);
    showMessage(`Too many requests. Please try again in ${waitTime} minutes.`);
  }
}
```

---

## 4. Authentication

### Authentication Flow

```
1. User logs in → Receives accessToken (15 min expiry)
2. refreshToken stored as HttpOnly cookie (7 days expiry)
3. Use accessToken in Authorization header for protected routes
4. When accessToken expires → Call /api/Auth/refresh-token
5. New accessToken received → Continue using API
```

### Access Token

- **Expiry:** 15 minutes
- **Storage:** In memory (not localStorage)
- **Usage:** Include in `Authorization` header

```http
Authorization: Bearer <accessToken>
```

### Refresh Token

- **Expiry:** 7 days
- **Storage:** HttpOnly cookie (automatic)
- **Usage:** Automatically sent with requests
- **Rotation:** New token issued on each refresh

### Token Refresh Implementation

```javascript
// Auto-refresh token on 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(
          '/api/Auth/refresh-token',
          {},
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        );
        
        accessToken = data.accessToken;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 5. Frontend Implementation

### Axios Configuration

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://your-api.com',
  withCredentials: true,  // Required for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add access token to requests
let accessToken = null;

api.interceptors.request.use(
  config => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        const { data } = await api.post('/api/Auth/refresh-token');
        accessToken = data.accessToken;
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
      } catch {
        // Refresh failed - redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Token Storage

```javascript
// ✅ GOOD: Store in memory
let accessToken = null;

// Set after login
accessToken = response.data.accessToken;

// ❌ BAD: Don't store in localStorage
// localStorage.setItem('token', accessToken); // Security risk!
```

### Making Authenticated Requests

```javascript
// Example: Fetch users (admin only)
const fetchUsers = async (filters = {}) => {
  try {
    const response = await api.get('/api/Admin/users', {
      params: filters
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      // Not admin - redirect
      navigate('/unauthorized');
    } else if (error.response?.status === 401) {
      // Token expired - will be auto-refreshed by interceptor
      throw error;
    }
    throw error;
  }
};
```

### Error Handling Utility

```javascript
// Error handler utility
const handleApiError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  
  const status = error.response.status;
  const message = error.response.data?.message || 'An error occurred';
  
  switch (status) {
    case 400:
      return `Invalid request: ${message}`;
    case 401:
      return 'Session expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return message;
  }
};

// Usage
try {
  const data = await api.get('/api/endpoint');
} catch (error) {
  const userMessage = handleApiError(error);
  showNotification(userMessage, 'error');
}
```

### React Hook Example

```javascript
// useApi hook
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const request = async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api(config);
      return response.data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { request, loading, error };
};

// Usage
const MyComponent = () => {
  const { request, loading, error } = useApi();
  
  const fetchData = async () => {
    try {
      const data = await request({
        method: 'GET',
        url: '/api/Admin/users',
        params: { page: 1, limit: 10 }
      });
      console.log(data);
    } catch (err) {
      // Error already set in hook
    }
  };
  
  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button onClick={fetchData}>Fetch</button>
    </div>
  );
};
```

---

## Best Practices Summary

1. ✅ **Always use `withCredentials: true`** for cookie-based authentication
2. ✅ **Store access tokens in memory**, not localStorage
3. ✅ **Implement automatic token refresh** on 401 errors
4. ✅ **Handle rate limiting** gracefully with user-friendly messages
5. ✅ **Validate inputs** before sending requests
6. ✅ **Show loading states** during API calls
7. ✅ **Handle errors** with user-friendly messages
8. ✅ **Use pagination** for large datasets
9. ✅ **Implement retry logic** for transient errors
10. ✅ **Log errors** for debugging (but don't expose to users)

---

**See also:**
- [Authentication API](../auth/index.md) - For login and token management
- [AI API](../user/ai.md) - For AI interactions
- [Admin API](../admin/users.md) - For administrative functions

