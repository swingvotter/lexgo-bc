# Admin API Documentation

**Base URL:** `/api/Admin`  
**Version:** 1.0

---

## ⚠️ Admin Only

All endpoints in this section require:
1. **Authentication** - Valid access token
2. **Authorization** - User must have `admin` role

---

## Table of Contents

1. [Get All Users](#1-get-all-users)

---

## 1. Get All Users

Fetches a paginated list of all users with optional filtering, searching, and sorting capabilities.

**Endpoint:** `GET /api/Admin/users`

### Authentication & Authorization

✅ **Required** - Admin role only

Include the access token in the Authorization header:
```http
Authorization: Bearer <accessToken>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ No | 1 | Page number (min: 1) |
| `limit` | number | ❌ No | 10 | Items per page (min: 1, max: 100) |
| `role` | string | ❌ No | - | Filter by role: `student`, `lecturer`, `admin`, `judge`, `lawyer` |
| `search` | string | ❌ No | - | Search in email, firstName, lastName (case-insensitive) |
| `sortBy` | string | ❌ No | `createdAt` | Sort field: `createdAt`, `email`, `firstName`, `lastName`, `role` |
| `sortOrder` | string | ❌ No | `desc` | Sort order: `asc` or `desc` |

### Example Requests

#### Basic Request
```http
GET /api/Admin/users
Authorization: Bearer <accessToken>
```

#### With Pagination
```http
GET /api/Admin/users?page=2&limit=20
Authorization: Bearer <accessToken>
```

#### With Filtering
```http
GET /api/Admin/users?role=student&page=1&limit=10
Authorization: Bearer <accessToken>
```

#### With Search
```http
GET /api/Admin/users?search=john&page=1&limit=10
Authorization: Bearer <accessToken>
```

#### With Sorting
```http
GET /api/Admin/users?sortBy=email&sortOrder=asc&page=1&limit=10
Authorization: Bearer <accessToken>
```

#### Combined Filters
```http
GET /api/Admin/users?role=student&search=john&sortBy=createdAt&sortOrder=desc&page=1&limit=20
Authorization: Bearer <accessToken>
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "64a...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+233123456789",
      "university": "University of Ghana",
      "acadamicLevel": "Level 300",
      "program": "LL.B",
      "studentId": "STU123456",
      "role": "student",
      "onboardingCompleted": false,
      "progress": {
        "lessonsCompleted": 5,
        "learningStreak": 3,
        "lastActiveDate": "2024-12-01T00:00:00.000Z"
      },
      "askAI": 12,
      "detectedCountry": "GH",
      "createdAt": "2024-11-15T00:00:00.000Z"
    }
    // ... more users
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false,
    "startIndex": 1,
    "endIndex": 10
  }
}
```

### Response Fields

#### User Object
- **Sensitive fields excluded:** `password`, `refreshToken`, `passwordReset`
- All other user fields are included

#### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `totalItems` | number | Total number of users matching query |
| `totalPages` | number | Total number of pages |
| `hasNextPage` | boolean | Whether there is a next page |
| `hasPrevPage` | boolean | Whether there is a previous page |
| `startIndex` | number | Index of first item on current page (1-based) |
| `endIndex` | number | Index of last item on current page (1-based) |

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 401 | `accessToken is absent` | Missing or invalid access token |
| 401 | `Authentication required` | User not authenticated |
| 403 | `Access denied. Admin privileges required.` | User is not an admin |
| 404 | `User not found` | Admin user not found in database |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Failed to fetch users. Please try again later.` | Server error |

### Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Window:** 15 minutes
- **Response:** `429 Too Many Requests` if exceeded

### Frontend Notes

#### Pagination Implementation

```javascript
// Example: Fetch users with pagination
const fetchUsers = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await axios.get(
    `/api/Admin/users?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    }
  );
  
  return response.data;
};
```

#### Search Implementation

```javascript
// Example: Search users
const searchUsers = async (searchTerm) => {
  const response = await axios.get(
    `/api/Admin/users?search=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    }
  );
  
  return response.data;
};
```

#### Filtering by Role

```javascript
// Example: Filter by role
const getStudents = async () => {
  const response = await axios.get(
    '/api/Admin/users?role=student&page=1&limit=50',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    }
  );
  
  return response.data;
};
```

#### Sorting

```javascript
// Example: Sort by creation date (newest first)
const getNewestUsers = async () => {
  const response = await axios.get(
    '/api/Admin/users?sortBy=createdAt&sortOrder=desc&page=1&limit=20',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      withCredentials: true
    }
  );
  
  return response.data;
};
```

### Best Practices

1. **Pagination:** Always use pagination for large datasets. Default limit is 10, max is 100.
2. **Search:** Use search for finding specific users. Search is case-insensitive and searches email, firstName, and lastName.
3. **Filtering:** Combine filters for more precise results (e.g., `role=student&search=john`).
4. **Sorting:** Use sorting to organize results. Default is newest first (`createdAt` desc).
5. **Error Handling:** Handle 403 errors by redirecting non-admin users, and 401 errors by refreshing tokens.

### Example: Complete User Management Component

```javascript
// React example
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await axios.get(
        `/api/Admin/users?${params}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
          withCredentials: true
        }
      );
      
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      if (error.response?.status === 403) {
        // Redirect non-admin users
        navigate('/unauthorized');
      } else if (error.response?.status === 401) {
        // Refresh token and retry
        await refreshToken();
        fetchUsers();
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return (
    <div>
      {/* Search and filters */}
      <input 
        placeholder="Search users..."
        onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
      />
      
      {/* User list */}
      {users.map(user => (
        <UserCard key={user._id} user={user} />
      ))}
      
      {/* Pagination */}
      <Pagination 
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setFilters({...filters, page})}
      />
    </div>
  );
};
```

---

- [Authentication API](../auth/index.md) - For login and token management
- [Common Reference](../general/common.md) - For error handling and best practices

