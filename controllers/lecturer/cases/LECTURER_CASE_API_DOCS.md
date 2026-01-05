# Lecturer Case API Documentation

Base URL: `/api/LecturerCases`

## 1. Create a Case
Create a new case for a specific course.

**Endpoint:** `POST /:courseId`
**Authentication:** Required (Lecturer must own the course)
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
| `caseCategory` | `string` | Yes | Category of the case (e.g., Criminal, Civil). |
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
| `page` | `number` | `1` | Page number for pagination. |
| `limit` | `number` | `10` | Number of items per page (max 100). |
| `title` | `string` | - | Filter cases by title (case-insensitive search). |
| `category` | `string` | - | Filter cases by category (case-insensitive search). |
| `sortedBy` | `string` | `_id` | Field to sort by (e.g., `title`, `caseCode`). |
| `sortOrder` | `string` | `desc` | Sort direction: `asc` or `desc`. |

### Responses
- **200 OK**: Returns list of cases with pagination metadata.
    ```json
    {
      "success": true,
      "count": 10,
      "total": 50,
      "totalPages": 5,
      "currentPage": 1,
      "data": [
        {
          "_id": "...",
          "title": "Case Title",
          "url": "https://res.cloudinary.com/... (Signed URL if document exists)",
          ...
        }
      ]
    }
    ```
- **400 Bad Request**: Missing course ID.
- **500 Server Error**: Internal server error.

---

## 3. Delete a Case
Delete a specific case.

**Endpoint:** `DELETE /:id`
**Authentication:** Required (Must be the creator of the case)

### Path Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The ID of the case to delete. |

### Responses
- **200 OK**: Case deleted successfully.
- **404 Not Found**: Case not found or unauthorized.
- **500 Server Error**: Internal server error.
