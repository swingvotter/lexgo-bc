# AI API Documentation

**Base URL:** `/api/AI`  
**Version:** 1.0

---

## Table of Contents

1. [Ask AI](#1-ask-ai)

---

## 1. Ask AI

Increments the user's AI question counter. This endpoint tracks how many times a user has interacted with the AI.

**Endpoint:** `POST /api/AI/ask-AI`

### Authentication

✅ **Required** - This endpoint requires authentication.

Include the access token in the Authorization header:
```http
Authorization: Bearer <accessToken>
```

### Request Body

Currently, no request body is required. The endpoint simply increments the counter.

**Note:** This endpoint is prepared for future AI integration where you may need to send:
- `question` - The user's question
- `context` - Additional context for the AI

### Example Request

```http
POST /api/AI/ask-AI
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Ai asked successfully"
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 401 | `accessToken is absent` | Missing or invalid access token |
| 401 | `Invalid or expired token` | Token has expired or is invalid |
| 429 | `Too many AI requests. Please try again later.` | Rate limit exceeded |
| 500 | `Failed to process AI request. Please try again later.` | Server error |

### Rate Limiting

- **Limit:** 20 requests per 15 minutes per user
- **Window:** 15 minutes
- **Response:** `429 Too Many Requests` if exceeded

### Frontend Notes

- Ensure the user is authenticated before calling this endpoint
- Handle rate limiting gracefully by showing appropriate messages
- The counter is automatically incremented on the server side
- This endpoint is idempotent - calling it multiple times will increment the counter each time

### Example Frontend Implementation

```javascript
// Using Axios
const askAI = async (accessToken) => {
  try {
    const response = await axios.post(
      '/api/AI/ask-AI',
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // Handle rate limiting
      console.log('Too many requests. Please wait.');
    } else if (error.response?.status === 401) {
      // Handle authentication error - refresh token
      console.log('Token expired. Refreshing...');
    }
    throw error;
  }
};
```

---

## Future Enhancements

This endpoint is designed to be extended with actual AI functionality. Future versions may include:

- **Request Body:**
  ```json
  {
    "question": "What is contract law?",
    "context": "I'm studying LL.B Level 300"
  }
  ```

- **Response:**
  ```json
  {
    "success": true,
    "message": "Ai asked successfully",
    "data": {
      "aiResponse": "Contract law is...",
      "askAI": 15  // Updated counter
    }
  }
  ```

---

**See also:** 
- [Authentication API](./auth.md) - For login and token management
- [Common Reference](./common.md) - For error handling and best practices

