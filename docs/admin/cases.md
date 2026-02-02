# Admin Case Management API
**Base URL:** `/api/Admin/cases`  
**Version:** 1.0
**Collection:** `adminCases`

---

## Overview

The Admin Case API allows for management of the global legal case database. These cases are intended for general reference across the platform. While retrieval is open to all authenticated users, management actions (create, update, delete) are restricted to administrators.

---

## Table of Contents

1. [Create Multiple Cases (Bulk)](#1-create-multiple-cases-bulk)
2. [Create Single Case](#2-create-single-case)
3. [Get All Cases](#3-get-all-cases)
4. [Get Case by ID](#4-get-case-by-id)
5. [Update Case](#5-update-case)
6. [Delete Case](#6-delete-case)

---

## 1. Create Multiple Cases (Bulk)

Allows an administrator to add multiple cases in a single request. This endpoint validates for duplicate citations both within the request body and against existing database records.

**Endpoint:** `POST /api/Admin/cases/bulk`  
**Access:** Private (Admin Only)

### Authentication

✅ **Required** - Admin access token required.

```http
Authorization: Bearer <adminAccessToken>
```

### Request Body

Expects an **array** of case objects. Minimum 1 case required.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | string | ✅ Yes | Trimmed, non-empty | The full title of the case |
| `citation` | string | ✅ Yes | Trimmed, unique | Unique case citation (e.g., "[2023] GHASC 45") |
| `jurisdiction` | string | ✅ Yes | Non-empty | Legal jurisdiction (e.g., "Ghana", "Nigeria") |
| `court` | object | ✅ Yes | See below | Court information |
| `court.name` | string | ✅ Yes | Non-empty | Name of the court |
| `court.level` | string | ❌ No | - | Court level (e.g., "Supreme Court", "High Court") |
| `decision` | string | ❌ No | Can be empty | Summary of the final decision |
| `judgmentDate` | date | ❌ No | ISO format, max "now" | Date of the judgment (e.g., "2023-05-15") |
| `summary` | string | ❌ No | Can be empty | Brief overview of the case |
| `ratioDecidendi` | string | ❌ No | Can be empty | The main legal principle (reason for decision) |
| `obiterDicta` | string | ❌ No | Can be empty | Sayings by the way (non-binding remarks) |
| `proceduralHistory` | string | ❌ No | Can be empty | History of the case through lower courts |
| `parties` | array | ✅ Yes | Min 1 party | Array of party objects |
| `parties[].name` | string | ✅ Yes | Non-empty | Name of the party |
| `parties[].role` | string | ✅ Yes | "Appellant" or "Respondent" | Role of the party |
| `judges` | array | ✅ Yes | Min 1 judge | Array of judge objects |
| `judges[].name` | string | ✅ Yes | Non-empty | Name of the judge |
| `judges[].position` | string | ❌ No | Can be empty | Position/title of the judge |
| `legalAuthorities` | array | ❌ No | Default: [] | Array of legal authority objects |
| `legalAuthorities[].name` | string | ❌ No | Can be empty | Name of the legal authority (e.g., "Constitution of Ghana 1992") |
| `legalAuthorities[].section` | string | ❌ No | Can be empty | Relevant section (e.g., "Article 23") |
| `precedents` | array | ❌ No | Default: [] | Array of precedent objects |
| `precedents[].citation` | string | ❌ No | Can be empty | Citation of the precedent case |
| `precedents[].title` | string | ❌ No | Can be empty | Title of the precedent case |
| `keywords` | array | ❌ No | Default: [] | Array of strings for search optimization |

### Example Request

```json
[
  {
    "title": "Republic v. Attorney General Ex Parte Mensah",
    "citation": "[2023] GHASC 45",
    "jurisdiction": "Ghana",
    "decision": "Appeal allowed",
    "judgmentDate": "2023-05-15",
    "summary": "This case dealt with constitutional interpretation regarding the right to fair hearing in administrative proceedings.",
    "ratioDecidendi": "The court held that natural justice requires that parties be given adequate notice and opportunity to be heard before any adverse decision is made.",
    "obiterDicta": "The court noted that administrative bodies should adopt best practices in ensuring procedural fairness.",
    "proceduralHistory": "The case originated from the High Court and was appealed to the Supreme Court.",
    "court": {
      "name": "Supreme Court of Ghana",
      "level": "Supreme Court"
    },
    "parties": [
      {
        "name": "Republic of Ghana",
        "role": "Appellant"
      },
      {
        "name": "John Mensah",
        "role": "Respondent"
      }
    ],
    "judges": [
      {
        "name": "Justice Anin Yeboah",
        "position": "Chief Justice"
      },
      {
        "name": "Justice Sophia Akuffo",
        "position": "Justice"
      }
    ],
    "legalAuthorities": [
      {
        "name": "Constitution of Ghana 1992",
        "section": "Article 23"
      },
      {
        "name": "Evidence Act",
        "section": "Section 45"
      }
    ],
    "precedents": [
      {
        "citation": "[2020] GHASC 12",
        "title": "Tuffuor v. Attorney General"
      }
    ],
    "keywords": ["constitutional law", "natural justice", "fair hearing", "administrative law"]
  },
  {
    "title": "Kofi v. National Insurance Commission",
    "citation": "[2023] GHACA 78",
    "jurisdiction": "Ghana",
    "decision": "Appeal dismissed",
    "judgmentDate": "2023-08-22",
    "summary": "The appellant challenged the decision of the National Insurance Commission regarding insurance policy interpretation.",
    "ratioDecidendi": "Insurance policies must be interpreted in favor of the insured where there is ambiguity in the terms.",
    "obiterDicta": "The court suggested that insurance companies should use plain language in their policy documents.",
    "proceduralHistory": "Appeal from the Court of Appeal.",
    "court": {
      "name": "Court of Appeal",
      "level": "Appellate Court"
    },
    "parties": [
      {
        "name": "Kwame Kofi",
        "role": "Appellant"
      },
      {
        "name": "National Insurance Commission",
        "role": "Respondent"
      }
    ],
    "judges": [
      {
        "name": "Justice Gertrude Torkornoo",
        "position": "Presiding Judge"
      }
    ],
    "legalAuthorities": [
      {
        "name": "Insurance Act 2006",
        "section": "Section 12"
      }
    ],
    "precedents": [
      {
        "citation": "[2019] GHACA 34",
        "title": "Amoah v. Star Assurance"
      }
    ],
    "keywords": ["insurance law", "contract interpretation", "consumer protection"]
  }
]
```

### Success Response (201)

```json
{
  "success": true,
  "message": "2 cases successfully created",
  "data": [
    {
      "_id": "697ecca5507912f32059a3b9",
      "title": "Republic v. Attorney General Ex Parte Mensah",
      "citation": "[2023] GHASC 45",
      "jurisdiction": "Ghana",
      "decision": "Appeal allowed",
      "judgmentDate": "2023-05-15T00:00:00.000Z",
      "summary": "This case dealt with constitutional interpretation...",
      "ratioDecidendi": "The court held that natural justice requires...",
      "obiterDicta": "The court noted that administrative bodies...",
      "proceduralHistory": "The case originated from the High Court...",
      "court": {
        "name": "Supreme Court of Ghana",
        "level": "Supreme Court"
      },
      "parties": [ ... ],
      "judges": [ ... ],
      "legalAuthorities": [ ... ],
      "precedents": [ ... ],
      "keywords": [ ... ],
      "createdAt": "2026-02-01T03:46:45.417Z",
      "updatedAt": "2026-02-01T03:46:45.417Z",
      "__v": 0
    },
    ...
  ]
}
```

### Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `Validation failed` | One or more fields failed validation. Returns array of error messages. |
| 400 | `Duplicate citations found in the request body` | Multiple cases in the request have the same citation. |
| 409 | `Some cases already exist in the database` | One or more citations already exist. Returns `existingCitations` array. |
| 401 | `Unauthorized` | Missing or invalid admin token |
| 500 | `Internal server error` | Server error during processing |

**Example Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "\"title\" is required",
    "\"citation\" is required",
    "\"parties\" must contain at least 1 items"
  ]
}
```

**Example Duplicate Error:**
```json
{
  "success": false,
  "message": "Some cases already exist in the database",
  "existingCitations": [
    "[2023] GHASC 45",
    "[2023] GHACA 78"
  ]
}
```

### Frontend Implementation

```javascript
async function createBulkCases(cases, adminToken) {
  try {
    const response = await fetch('http://localhost:3000/api/Admin/cases/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(cases)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400 && data.errors) {
        // Handle validation errors
        console.error('Validation errors:', data.errors);
      } else if (response.status === 409) {
        // Handle duplicate citations
        console.error('Duplicate citations:', data.existingCitations);
      }
      throw new Error(data.message);
    }

    console.log(`${data.data.length} cases created successfully`);
    return data.data;
  } catch (error) {
    console.error('Error creating cases:', error);
    throw error;
  }
}

// Usage
const cases = [
  {
    title: "Test Case",
    citation: "TEST-001",
    jurisdiction: "Ghana",
    court: { name: "High Court", level: "High Court" },
    parties: [{ name: "Party A", role: "Appellant" }],
    judges: [{ name: "Judge A", position: "Judge" }]
  }
];

createBulkCases(cases, adminAccessToken);
```

### Important Notes

1. **Citation Uniqueness:** Each citation must be unique across the entire database and within the request.
2. **Validation:** All cases are validated before any are inserted. If one fails, none are created.
3. **Atomic Operation:** Either all cases are created successfully, or none are created.
4. **Trimming:** String fields are automatically trimmed of whitespace.
5. **Date Format:** Use ISO 8601 format for dates (YYYY-MM-DD).
6. **Party Roles:** Only "Appellant" and "Respondent" are valid roles.

---

## 2. Create Single Case

Create a single case in the database.

**Endpoint:** `POST /api/Admin/cases`  
**Access:** Private (Admin Only)

### Request Body

Accepts the same fields as bulk create, but as a **single object** (not an array).

### Example Request

```json
{
  "title": "State v. Agyeman",
  "citation": "[2024] GHAHC 156",
  "jurisdiction": "Ghana",
  "decision": "Guilty verdict upheld",
  "judgmentDate": "2024-01-10",
  "summary": "Criminal case involving fraud and misrepresentation in land transactions.",
  "ratioDecidendi": "Fraudulent misrepresentation in land sales constitutes a criminal offense under the Criminal Offences Act.",
  "court": {
    "name": "High Court, Accra",
    "level": "High Court"
  },
  "parties": [
    {
      "name": "The State",
      "role": "Appellant"
    },
    {
      "name": "Samuel Agyeman",
      "role": "Respondent"
    }
  ],
  "judges": [
    {
      "name": "Justice Mary Yanzuh",
      "position": "High Court Judge"
    }
  ],
  "legalAuthorities": [
    {
      "name": "Criminal Offences Act 1960",
      "section": "Section 131"
    }
  ],
  "keywords": ["criminal law", "fraud", "land law"]
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Case created successfully",
  "data": { ... }
}
```

---

## 3. Get All Cases

Retrieve all cases with pagination, filtering, and search capabilities.

**Endpoint:** `GET /api/Admin/cases`  
**Access:** Private (Authenticated Users)

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | number | 1 | - | Page number for pagination |
| `limit` | number | 10 | 50 | Number of items per page |
| `sortBy` | string | "createdAt" | - | Field to sort by (e.g., "title", "judgmentDate", "createdAt") |
| `order` | string | "desc" | - | Sort order: "asc" or "desc" |
| `search` | string | - | - | Search in title, citation, summary, ratioDecidendi, keywords |
| `title` | string | - | - | Filter by exact title |
| `citation` | string | - | - | Filter by exact citation |
| `jurisdiction` | string | - | - | Filter by jurisdiction |
| `courtLevel` | string | - | - | Filter by court level |
| `courtName` | string | - | - | Filter by court name |

### Example Requests

```http
GET /api/Admin/cases?page=1&limit=20
GET /api/Admin/cases?search=constitutional
GET /api/Admin/cases?jurisdiction=Ghana&courtLevel=Supreme Court
GET /api/Admin/cases?sortBy=judgmentDate&order=asc
```

### Success Response (200)

```json
{
  "success": true,
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  },
  "data": [
    {
      "_id": "697ecca5507912f32059a3b9",
      "title": "Republic v. Attorney General Ex Parte Mensah",
      "citation": "[2023] GHASC 45",
      "jurisdiction": "Ghana",
      "court": { ... },
      "parties": [ ... ],
      "judges": [ ... ],
      "createdAt": "2026-02-01T03:46:45.417Z",
      "updatedAt": "2026-02-01T03:46:45.417Z"
    },
    ...
  ]
}
```

### Frontend Implementation

```javascript
async function getCases(filters = {}) {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.search && { search: filters.search }),
    ...(filters.jurisdiction && { jurisdiction: filters.jurisdiction }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.order && { order: filters.order })
  });

  const response = await fetch(
    `http://localhost:3000/api/Admin/cases?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return await response.json();
}

// Usage
const cases = await getCases({
  page: 1,
  limit: 20,
  search: 'constitutional',
  jurisdiction: 'Ghana'
});
```

---

## 4. Get Case by ID

Retrieve a single case by its ID.

**Endpoint:** `GET /api/Admin/cases/:id`  
**Access:** Private (Authenticated Users)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "697ecca5507912f32059a3b9",
    "title": "Republic v. Attorney General Ex Parte Mensah",
    "citation": "[2023] GHASC 45",
    ...
  }
}
```

### Error Response (404)

```json
{
  "success": false,
  "message": "Case not found"
}
```

---

## 5. Update Case

Update an existing case.

**Endpoint:** `PATCH /api/Admin/cases/:id`  
**Access:** Private (Admin Only)

### Request Body

All fields are optional. Only include fields you want to update.

---

## 6. Delete Case

Delete a case from the database.

**Endpoint:** `DELETE /api/Admin/cases/:id`  
**Access:** Private (Admin Only)

### Success Response (200)

```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

---

**See also:**
- [Authentication API](../auth/index.md) - For admin login and token management
- [Common Reference](../general/common.md) - For error handling and best practices
