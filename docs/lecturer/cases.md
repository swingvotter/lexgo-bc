# Lecturer Case Management API

**Base URL:** `/api/v1/LecturerCases`
**Description:** Manages course-specific case studies and materials. These cases are uploaded by lecturers and can have AI quizzes attached. They are stored in the `lecturerCases` collection.

---

## 1. Create a Case
Create a new case for a specific course.

**Endpoint:** `POST /:courseId`
**Authentication:** Required (Lecturer or Approved Sub-Lecturer)
**Content-Type:** `multipart/form-data`

### Path Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `courseId` | `string` | The ID of the course to attach the case to. |

### Form Data (Body)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | Title of the case. Must be unique within the course. |
| `sourceOfCase` | `string` | Yes | The source/origin of the case. |
| `caseCode` | `string` | Yes | Unique code identifier for the case. |
| `caseCategory` | `string` | Yes | Category of the case. |
| `caseDocument` | `File` | Yes | PDF file upload associated with the case. |

### Responses
- **201 Created**: Case created successfully.
- **400 Bad Request**: Missing fields (including case document) or invalid input.
- **404 Not Found**: Course not found or unauthorized.
- **409 Conflict**: A case with the same title already exists in this course.
- **500 Server Error**: Internal server error.

---

## 2. Get Cases
Retrieve a paginated list of cases for a specific course with optional filtering and sorting.

**Endpoint:** `GET /:courseId`
**Authentication:** Required

### Path Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `courseId` | `string` | The ID of the course to retrieve cases from. |

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `number` | `25` | Number of items to return. |
| `cursor` | `string` | `null` | Cursor for pagination. |
| `title` | `string` | - | Filter cases by title (regex). |
| `category` | `string` | - | Filter cases by category (regex). |
| `sortOrder` | `string` | `desc` | Sort direction: `asc` or `desc`. |

### Responses
- **200 OK**: Returns list of cases with cursor pagination metadata.
    ```json
    {
      "success": true,
      "count": 25,
      "total": 50,
      "data": [
        {
          "_id": "...",
          "title": "Case Title",
          "url": "https://res.cloudinary.com/... (Signed URL)",
          ...
        }
      ],
      "nextCursor": "...",
      "hasMore": true
    }
    ```
- **400 Bad Request**: Missing course ID.
- **500 Server Error**: Internal server error.

---

## 3. Get All Cases (By Lecturer)
Retrieve a paginated list of all cases created by the authenticated lecturer, filtered by query parameters.

**Endpoint:** `GET /`
**Authentication:** Required

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `number` | `25` | Number of items to return. |
| `cursor` | `string` | `null` | Cursor for pagination. |
| `title` | `string` | - | Filter cases by title (regex). |
| `category` | `string` | - | Filter cases by category (regex). |
| `sortOrder` | `string` | `desc` | Sort direction: `asc` or `desc`. |

### Responses
- **200 OK**: Returns list of cases with cursor pagination metadata.
    ```json
    {
      "success": true,
      "count": 25,
      "total": 50,
      "data": [
        {
          "_id": "...",
          "title": "Case Title",
          "url": "https://res.cloudinary.com/... (Signed URL)",
          ...
        }
      ],
      "nextCursor": "...",
      "hasMore": true
    }
    ```
- **500 Server Error**: Internal server error.

---

## 4. Delete a Case
Delete a specific case.

**Endpoint:** `DELETE /:id`
**Authentication:** Required (Lecturer must be the creator of the case)

### Path Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The ID of the case to delete. |

### Responses
- **200 OK**: Case and all related data (quizzes, submissions) deleted successfully.
- **404 Not Found**: Case not found or unauthorized.
- **500 Server Error**: Internal server error.
