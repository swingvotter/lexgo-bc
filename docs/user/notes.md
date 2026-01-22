# Notes API Documentation

**Base URL:** `/api/Notes`  
**Version:** 1.0

---

## Table of Contents

1. [Get All Notes](#1-get-all-notes)
2. [Get Single Note](#2-get-single-note)
3. [Create Note](#3-create-note)
4. [Update Note](#4-update-note)
5. [Delete Note](#5-delete-note)

---

## Overview

The Notes API allows users to create, read, update, and delete their personal notes. All endpoints require authentication and are rate-limited to 100 requests per 15 minutes.

### Authentication

✅ **Required** - All endpoints require authentication.

Include the access token in the Authorization header:
```http
Authorization: Bearer <accessToken>
```

### Rate Limiting

- **Limit:** 100 requests per 15 minutes per user
- **Window:** 15 minutes
- **Response:** `429 Too Many Requests` if exceeded

---

## 1. Get All Notes

Retrieves a paginated list of the authenticated user's notes with optional filtering and sorting.

**Endpoint:** `GET /api/Notes/get-all`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: 1, min: 1) |
| `limit` | number | ❌ No | Items per page (default: 10, max: 100) |
| `legalTopic` | string | ❌ No | Filter by legal topic (exact match) |
| `importanceLevel` | string | ❌ No | Filter by importance: `Low Priority`, `Medium Priority`, `High Priority` |
| `search` | string | ❌ No | Search in title, content, and legalTopic (max 100 chars, case-insensitive) |
| `sortBy` | string | ❌ No | Sort field: `createdAt`, `updatedAt`, `title`, `importanceLevel`, `legalTopic` (default: `createdAt`) |
| `sortOrder` | string | ❌ No | Sort direction: `asc` or `desc` (default: `desc`) |

### Example Request

```http
GET /api/Notes/get-all?page=1&limit=10&importanceLevel=High Priority&search=contract&sortBy=createdAt&sortOrder=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Notes fetched successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Contract Law Basics",
      "legalTopic": "Contract Law",
      "importanceLevel": "High Priority",
      "content": "Contract law governs agreements between parties...",
      "createdAt": "2024-12-01T10:30:00.000Z",
      "updatedAt": "2024-12-01T10:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Tort Law Notes",
      "legalTopic": "Tort Law",
      "importanceLevel": "Medium Priority",
      "content": "Tort law deals with civil wrongs...",
      "createdAt": "2024-12-01T09:15:00.000Z",
      "updatedAt": "2024-12-01T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "startIndex": 1,
    "endIndex": 10
  }
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 401 | `Authentication required` | Missing or invalid access token |
| 429 | `Too many requests. Please try again later.` | Rate limit exceeded |
| 500 | `Failed to fetch notes. Please try again later.` | Server error |

### Frontend Example

```javascript
// Fetch notes with filters
const fetchNotes = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.legalTopic && { legalTopic: filters.legalTopic }),
      ...(filters.importanceLevel && { importanceLevel: filters.importanceLevel }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const response = await axios.get(`/api/Notes/get-all?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired - refresh token
      await refreshToken();
      return fetchNotes(filters); // Retry
    }
    throw error;
  }
};

// Usage
const notes = await fetchNotes({
  page: 1,
  limit: 20,
  importanceLevel: 'High Priority',
  search: 'contract',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

---

## 2. Get Single Note

Retrieves a specific note by ID. Only notes belonging to the authenticated user can be accessed.

**Endpoint:** `GET /api/Notes/get/:id`

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Note ID (MongoDB ObjectId) |

### Example Request

```http
GET /api/Notes/get/64a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Note fetched successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Contract Law Basics",
    "legalTopic": "Contract Law",
    "importanceLevel": "High Priority",
    "content": "Contract law governs agreements between parties...",
    "createdAt": "2024-12-01T10:30:00.000Z",
    "updatedAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Note ID is required` | Missing note ID in URL |
| 400 | `Invalid note ID format` | Invalid ObjectId format |
| 401 | `Unauthorized: user must log in` | Missing or invalid access token |
| 404 | `Note not found` | Note doesn't exist or doesn't belong to user |
| 500 | `Failed to fetch note. Please try again.` | Server error |

### Frontend Example

```javascript
// Get single note
const getNote = async (noteId) => {
  try {
    const response = await axios.get(`/api/Notes/get/${noteId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    });

    return response.data.data; // Returns the note object
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Note not found');
    }
    throw error;
  }
};

// Usage
const note = await getNote('64a1b2c3d4e5f6g7h8i9j0k1');
```

---

## 3. Create Note

Creates a new note for the authenticated user.

**Endpoint:** `POST /api/Notes/create`

### Request Body

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `title` | string | ✅ Yes | Note title | Max 200 characters, trimmed |
| `legalTopic` | string | ✅ Yes | Legal topic/category | Max 100 characters, trimmed |
| `importanceLevel` | string | ✅ Yes | Priority level | Must be: `Low Priority`, `Medium Priority`, or `High Priority` |
| `content` | string | ✅ Yes | Note content | Max 50,000 characters |

### Example Request

```http
POST /api/Notes/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Contract Law Basics",
  "legalTopic": "Contract Law",
  "importanceLevel": "High Priority",
  "content": "Contract law governs agreements between parties. Key elements include offer, acceptance, consideration, and intention to create legal relations."
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Contract Law Basics",
    "legalTopic": "Contract Law",
    "importanceLevel": "High Priority",
    "content": "Contract law governs agreements between parties. Key elements include offer, acceptance, consideration, and intention to create legal relations.",
    "createdAt": "2024-12-01T10:30:00.000Z",
    "updatedAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `All fields are required` | Missing required fields |
| 400 | `importance level is a required field` | Invalid importanceLevel value |
| 400 | `Title too long` | Title exceeds 200 characters |
| 400 | `Legal topic cannot exceed 100 characters` | LegalTopic too long |
| 400 | `Content cannot exceed 50000 characters` | Content too long |
| 401 | `Unauthorized: user must login first` | Missing or invalid access token |
| 409 | Duplicate title error | User already has a note with this title (unique constraint) |
| 429 | `Too many requests. Please try again later.` | Rate limit exceeded |
| 500 | `Failed to create note. Please try again.` | Server error |

### Frontend Example

```javascript
// Create note
const createNote = async (noteData) => {
  try {
    // Validate before sending
    if (!noteData.title || !noteData.legalTopic || !noteData.importanceLevel || !noteData.content) {
      throw new Error('All fields are required');
    }

    if (noteData.title.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }

    if (noteData.legalTopic.length > 100) {
      throw new Error('Legal topic cannot exceed 100 characters');
    }

    if (noteData.content.length > 50000) {
      throw new Error('Content cannot exceed 50,000 characters');
    }

    const validLevels = ['Low Priority', 'Medium Priority', 'High Priority'];
    if (!validLevels.includes(noteData.importanceLevel)) {
      throw new Error('Invalid importance level');
    }

    const response = await axios.post(
      '/api/Notes/create',
      {
        title: noteData.title.trim(),
        legalTopic: noteData.legalTopic.trim(),
        importanceLevel: noteData.importanceLevel,
        content: noteData.content
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return response.data.data; // Returns the created note
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('A note with this title already exists');
    }
    throw error;
  }
};

// Usage
const newNote = await createNote({
  title: 'Contract Law Basics',
  legalTopic: 'Contract Law',
  importanceLevel: 'High Priority',
  content: 'Contract law governs agreements...'
});
```

---

## 4. Update Note

Updates an existing note. Only notes belonging to the authenticated user can be updated. You can update any combination of fields - at least one field must be provided.

**Endpoint:** `PATCH /api/Notes/update/:id`

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Note ID (MongoDB ObjectId) |

### Request Body

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `title` | string | ❌ No | Note title | Max 200 characters, trimmed |
| `legalTopic` | string | ❌ No | Legal topic/category | Max 100 characters, trimmed |
| `importanceLevel` | string | ❌ No | Priority level | Must be: `Low Priority`, `Medium Priority`, or `High Priority` |
| `content` | string | ❌ No | Note content | Max 50,000 characters |

**Note:** At least one field must be provided for the update.

### Example Request

```http
PATCH /api/Notes/update/64a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Updated Contract Law Basics",
  "importanceLevel": "Medium Priority"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Updated Contract Law Basics",
    "legalTopic": "Contract Law",
    "importanceLevel": "Medium Priority",
    "content": "Contract law governs agreements between parties...",
    "createdAt": "2024-12-01T10:30:00.000Z",
    "updatedAt": "2024-12-01T11:45:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Note ID is required` | Missing note ID in URL |
| 400 | `Invalid note ID format` | Invalid ObjectId format |
| 400 | `At least one field is required to update` | No fields provided in request body |
| 400 | `Title too long` | Title exceeds 200 characters |
| 400 | `Legal topic cannot exceed 100 characters` | LegalTopic too long |
| 400 | `Content cannot exceed 50000 characters` | Content too long |
| 401 | `Unauthorized: user must log in` | Missing or invalid access token |
| 404 | `Note not found` | Note doesn't exist or doesn't belong to user |
| 429 | `Too many requests. Please try again later.` | Rate limit exceeded |
| 500 | `Failed to update note. Please try again.` | Server error |

### Frontend Example

```javascript
// Update note (partial update)
const updateNote = async (noteId, updates) => {
  try {
    // Validate at least one field
    if (!updates.title && !updates.legalTopic && !updates.importanceLevel && !updates.content) {
      throw new Error('At least one field is required to update');
    }

    // Build update object with only provided fields
    const updateData = {};
    if (updates.title !== undefined) {
      if (updates.title.length > 200) {
        throw new Error('Title cannot exceed 200 characters');
      }
      updateData.title = updates.title.trim();
    }
    if (updates.legalTopic !== undefined) {
      if (updates.legalTopic.length > 100) {
        throw new Error('Legal topic cannot exceed 100 characters');
      }
      updateData.legalTopic = updates.legalTopic.trim();
    }
    if (updates.importanceLevel !== undefined) {
      const validLevels = ['Low Priority', 'Medium Priority', 'High Priority'];
      if (!validLevels.includes(updates.importanceLevel)) {
        throw new Error('Invalid importance level');
      }
      updateData.importanceLevel = updates.importanceLevel;
    }
    if (updates.content !== undefined) {
      if (updates.content.length > 50000) {
        throw new Error('Content cannot exceed 50,000 characters');
      }
      updateData.content = updates.content;
    }

    const response = await axios.patch(
      `/api/Notes/update/${noteId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return response.data.data; // Returns the updated note
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Note not found');
    }
    throw error;
  }
};

// Usage - update only title and importance
const updatedNote = await updateNote('64a1b2c3d4e5f6g7h8i9j0k1', {
  title: 'Updated Contract Law Basics',
  importanceLevel: 'Medium Priority'
});
```

---

## 5. Delete Note

Deletes a note by ID. Only notes belonging to the authenticated user can be deleted.

**Endpoint:** `DELETE /api/Notes/delete/:id`

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Note ID (MongoDB ObjectId) |

### Example Request

```http
DELETE /api/Notes/delete/64a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Note ID is missing` | Missing note ID in URL |
| 400 | `Invalid note ID format` | Invalid ObjectId format |
| 401 | `Unauthorized: login required` | Missing or invalid access token |
| 404 | `Note not found or unauthorized` | Note doesn't exist or doesn't belong to user |
| 429 | `Too many requests. Please try again later.` | Rate limit exceeded |
| 500 | `Failed to delete note. Please try again.` | Server error |

### Frontend Example

```javascript
// Delete note
const deleteNote = async (noteId) => {
  try {
    const response = await axios.delete(`/api/Notes/delete/${noteId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Note not found');
    }
    throw error;
  }
};

// Usage with confirmation
const handleDelete = async (noteId) => {
  if (window.confirm('Are you sure you want to delete this note?')) {
    try {
      await deleteNote(noteId);
      console.log('Note deleted successfully');
      // Refresh notes list or navigate away
    } catch (error) {
      console.error('Failed to delete note:', error.message);
    }
  }
};
```

---

## Complete Frontend Example (React)

```javascript
import axios from 'axios';
import { useState, useEffect } from 'react';

// API configuration
const api = axios.create({
  baseURL: 'https://your-api.com',
  withCredentials: true
});

// Add token to requests
let accessToken = null;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Notes API functions
export const notesAPI = {
  // Get all notes
  getAll: async (filters = {}) => {
    const params = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.legalTopic && { legalTopic: filters.legalTopic }),
      ...(filters.importanceLevel && { importanceLevel: filters.importanceLevel }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const response = await api.get(`/api/Notes/get-all?${params}`);
    return response.data;
  },

  // Get single note
  getOne: async (noteId) => {
    const response = await api.get(`/api/Notes/get/${noteId}`);
    return response.data.data;
  },

  // Create note
  create: async (noteData) => {
    const response = await api.post('/api/Notes/create', noteData);
    return response.data.data;
  },

  // Update note
  update: async (noteId, updates) => {
    const response = await api.patch(`/api/Notes/update/${noteId}`, updates);
    return response.data.data;
  },

  // Delete note
  delete: async (noteId) => {
    const response = await api.delete(`/api/Notes/delete/${noteId}`);
    return response.data;
  }
};

// React Hook Example
export const useNotes = (filters = {}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesAPI.getAll(filters);
      setNotes(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filters.page, filters.limit, filters.legalTopic, filters.importanceLevel, filters.search]);

  return { notes, loading, error, pagination, refetch: fetchNotes };
};

// Usage in component
const NotesList = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const { notes, loading, error, pagination } = useNotes(filters);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {notes.map(note => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
      {pagination && (
        <div>
          <button 
            disabled={!pagination.hasPrevPage}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Data Models

### Note Object

```typescript
interface Note {
  _id: string;                    // MongoDB ObjectId
  userId: string;                 // Owner's user ID
  title: string;                  // Max 200 chars
  legalTopic: string;             // Max 100 chars
  importanceLevel: 'Low Priority' | 'Medium Priority' | 'High Priority';
  content: string;                // Max 50,000 chars
  createdAt: string;             // ISO 8601 date string
  updatedAt: string;             // ISO 8601 date string
}
```

### Pagination Object

```typescript
interface Pagination {
  page: number;                   // Current page number
  limit: number;                   // Items per page
  totalItems: number;              // Total number of items
  totalPages: number;              // Total number of pages
  hasNextPage: boolean;            // Whether there's a next page
  hasPrevPage: boolean;            // Whether there's a previous page
  startIndex: number;              // First item index (1-based)
  endIndex: number;                // Last item index (1-based)
}
```

---

## Best Practices

1. ✅ **Always validate input** before sending requests
2. ✅ **Handle pagination** for large datasets
3. ✅ **Implement search debouncing** to avoid excessive API calls
4. ✅ **Show loading states** during API operations
5. ✅ **Handle errors gracefully** with user-friendly messages
6. ✅ **Refresh token automatically** on 401 errors
7. ✅ **Respect rate limits** and show appropriate messages
8. ✅ **Trim whitespace** from title and legalTopic fields
9. ✅ **Validate importanceLevel** before sending
10. ✅ **Use optimistic updates** for better UX (update UI before API confirms)

---

## Common Use Cases

### Search and Filter Notes

```javascript
// Search with filters
const searchNotes = async (searchTerm, filters) => {
  return await notesAPI.getAll({
    search: searchTerm,
    importanceLevel: filters.priority,
    legalTopic: filters.topic,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
};
```

### Bulk Operations

```javascript
// Update multiple notes
const updateMultipleNotes = async (updates) => {
  const promises = updates.map(({ id, data }) => 
    notesAPI.update(id, data)
  );
  return await Promise.all(promises);
};
```

### Note Statistics

```javascript
// Get note statistics
const getNoteStats = async () => {
  const allNotes = await notesAPI.getAll({ limit: 1000 });
  const notes = allNotes.data;
  
  return {
    total: notes.length,
    byPriority: {
      high: notes.filter(n => n.importanceLevel === 'High Priority').length,
      medium: notes.filter(n => n.importanceLevel === 'Medium Priority').length,
      low: notes.filter(n => n.importanceLevel === 'Low Priority').length
    },
    byTopic: notes.reduce((acc, note) => {
      acc[note.legalTopic] = (acc[note.legalTopic] || 0) + 1;
      return acc;
    }, {})
  };
};
```

---

**See also:**
- [Authentication API](./auth.md) - For login and token management
- [Common Reference](./common.md) - For error handling and best practices

