# AI API Documentation

**Base URL:** `/api/ai`  
**Version:** 1.0

---

## Table of Contents

1. [Ask AI (Streaming)](#1-ask-ai-streaming)
2. [AI History](#2-ai-history)

---

## 1. Ask AI (Streaming)

Ask the AI a legal question and receive a **real-time streaming response** using Server-Sent Events (SSE). The response streams word-by-word, similar to ChatGPT.

**Endpoint:** `POST /api/ai/ask`

### Authentication

✅ **Required**

```http
Authorization: Bearer <accessToken>
```

### Request Body

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `question` | string | ✅ Yes | 2000 chars | The legal question to ask the AI |

**Example:**
```json
{
  "question": "What is constitutional law?"
}
```

### Response Format

**⚠️ IMPORTANT:** This endpoint returns **Server-Sent Events (SSE)**, NOT JSON.

**Response Headers:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Stream Format:**
```
data: Constitutional

data:  law

data:  is

data: [DONE]
```

- Each line starts with `data: ` followed by a text chunk
- Stream ends with `data: [DONE]`
- Errors are sent as `data: [ERROR]`

### How It Works

1. **Send POST request** with question in JSON body
2. **Receive SSE stream** - NOT a JSON response
3. **Parse each line** starting with `data: `
4. **Concatenate chunks** to build the full answer
5. **Stop when** you receive `[DONE]` marker
6. **Backend auto-saves** question + answer to database

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Validation failed` | Missing question or exceeds 2000 chars |
| 401 | `User not found` | Invalid token |
| 403 | `You have reached your AI question limit of 20.` | Daily quota exceeded |
| 500 | `Internal server error` | Server/OpenAI error |

**Note:** Errors after streaming starts are sent as `data: [ERROR]`

### Rate Limiting

- **Limit:** 20 questions per user
- **Counter:** Increments after successful response
- **Field:** User's `askAiCount` field

### Mobile App Integration

**Key Points:**
1. **Use HTTP streaming** - Your HTTP client must support reading response body as a stream
2. **Parse SSE format** - Split by newlines, extract content after `data: `
3. **Concatenate chunks** - Build full answer by appending each chunk
4. **Update UI in real-time** - Display chunks as they arrive for typing effect
5. **Handle markers** - Stop on `[DONE]`, show error on `[ERROR]`

**Example Flow (Pseudocode):**
```
1. POST /api/ai/ask with { question: "..." }
2. Open stream reader on response body
3. For each line in stream:
   - If line starts with "data: ":
     - Extract content after "data: "
     - If content == "[DONE]": break
     - If content == "[ERROR]": throw error
     - Else: append content to answer, update UI
4. Close stream
```

**React Native Example:**
```javascript
const askAI = async (question, token) => {
  const response = await fetch('http://localhost:3000/api/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const content = line.slice(6);
        
        if (content === '[DONE]') return fullAnswer;
        if (content === '[ERROR]') throw new Error('Stream error');
        
        if (content.trim()) {
          fullAnswer += content;
          // Update UI here with fullAnswer
        }
      }
    }
  }
};
```

**Flutter/Dart Example:**
```dart
Future<String> askAI(String question, String token) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/ai/ask'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({'question': question}),
  );

  String fullAnswer = '';
  
  await for (var chunk in response.stream.transform(utf8.decoder)) {
    final lines = chunk.split('\n');
    
    for (var line in lines) {
      if (line.startsWith('data: ')) {
        final content = line.substring(6);
        
        if (content == '[DONE]') return fullAnswer;
        if (content == '[ERROR]') throw Exception('Stream error');
        
        if (content.trim().isNotEmpty) {
          fullAnswer += content;
          // Update UI here
        }
      }
    }
  }
  
  return fullAnswer;
}
```

### Important Notes

1. **Response is NOT JSON** - It's a text stream in SSE format
2. **Must concatenate chunks** - Each chunk is a small piece of text
3. **First chunk arrives fast** - Typically 1-2 seconds
4. **Keep connection open** - Don't close until `[DONE]` received
5. **Backend handles saving** - Question and answer auto-saved to database
6. **User quota tracked** - `askAiCount` incremented automatically

### Database Storage

After streaming completes, the backend automatically:
- Saves question and full answer to `aiHistory` collection
- Increments user's `askAiCount` field
- Records timestamp

---

## 2. AI History

**Endpoint:** `GET /api/ai/history`  
**Status:** Not yet implemented

Will allow users to retrieve past AI conversations.

---

**See also:** 
- [Authentication API](../auth/index.md) - For login and token management
- [Common Reference](../general/common.md) - For error handling and best practices
