# Cases API Documentation

**Base URL:** `/api/Cases`  
**Version:** 1.0

---

## Overview

The Cases API allows for management and retrieval of legal cases. While retrieval is open to all authenticated users, management actions (create, update, delete) are restricted to administrators.

---

## 1. Create Multiple Cases (Bulk)

Allows an administrator to add multiple cases in a single request.

**Endpoint:** `POST /api/Cases/bulk`  
**Access:** Private (Admin Only)

### Request Body
Expects an array of case objects.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | The full title of the case |
| `citation` | string | ✅ Yes | Unique case citation |
| `jurisdiction` | string | ✅ Yes | Legal jurisdiction (e.g., Nigeria, International) |
| `court` | object | ✅ Yes | `{ name: string, level: string }` |
| `decision` | string | ❌ No | Summary of the final decision |
| `judgmentDate` | date | ❌ No | Date of the judgment (ISO format) |
| `summary` | string | ❌ No | Brief overview of the case |
| `ratioDecidendi` | string | ❌ No | The main legal principle (reason for decision) |
| `obiterDicta` | string | ❌ No | Sayings by the way |
| `proceduralHistory` | string | ❌ No | History of the case through lower courts |
| `parties` | array | ✅ Yes | Array of `{ name: string, role: "Appellant" | "Respondent" }` |
| `judges` | array | ✅ Yes | Array of `{ name: string, position: string }` |
| `legalAuthorities` | array | ❌ No | Array of `{ name: string, section: string }` |
| `precedents` | array | ❌ No | Array of `{ citation: string, title: string }` |
| `keywords` | array | ❌ No | Array of strings for search optimization |

### Success Response (201)
```json
{
  "success": true,
  "message": "5 cases successfully created",
  "data": [ ... ]
}
```

### Error Responses
- `400 Bad Request`: Validation failed or internal duplicates in payload.
- `409 Conflict`: One or more citations already exist in the database.

---

## 2. Create Single Case

**Endpoint:** `POST /api/Cases`  
**Access:** Private (Admin Only)

Accepts the same fields as the bulk create, but for a single object.

---

## 3. Get All Cases

**Endpoint:** `GET /api/Cases`  
**Access:** Private (Authenticated Users)

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in titles or citations
- `jurisdiction`: Filter by jurisdiction
- `courtLevel`: Filter by court level

---

## 4. Get Case by ID

**Endpoint:** `GET /api/Cases/:id`  
**Access:** Private (Authenticated Users)

---

## 5. Update Case

**Endpoint:** `PATCH /api/Cases/:id`  
**Access:** Private (Admin Only)

---

## 6. Delete Case

**Endpoint:** `DELETE /api/Cases/:id`  
**Access:** Private (Admin Only)
