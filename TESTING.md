# 🧪 API Testing Guide

## Setup Before Testing

```bash
npm install
npm run dev
```

Server will run on http://localhost:5000

---

## ✅ TEST SEQUENCE

### 1️⃣ AUTHENTICATION TESTS

#### Create Teacher Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mr. John Doe",
    "email": "teacher@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

**Expected Response:** 201, user details

---

#### Create Principal Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Principal Smith",
    "email": "principal@example.com",
    "password": "password123",
    "role": "principal"
  }'
```

**Expected Response:** 201, user details

---

#### Teacher Login (Get Token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'
```

**Expected Response:** 200

```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Mr. John Doe",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

**Save this token as TEACHER_TOKEN**

---

#### Principal Login (Get Token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@example.com",
    "password": "password123"
  }'
```

**Save this token as PRINCIPAL_TOKEN**

---

### 2️⃣ CONTENT UPLOAD TESTS

#### Upload Content (Without Time Window)

```bash
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Math Question Paper" \
  -F "subject=maths" \
  -F "description=Chapter 1 Questions"
```

**Expected Response:** 201, content details with status: "pending"

---

#### Upload Content (With Time Window - FUTURE)

```bash
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Science Quiz" \
  -F "subject=science" \
  -F "startTime=2026-04-27T20:00:00Z" \
  -F "endTime=2026-04-27T22:00:00Z"
```

---

#### Upload Content (With Time Window - ACTIVE NOW)

```bash
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Active Quiz" \
  -F "subject=maths" \
  -F "startTime=2026-04-26T00:00:00Z" \
  -F "endTime=2026-04-28T23:59:59Z"
```

---

#### View Own Content

```bash
curl -X GET http://localhost:5000/api/content/my \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

**Expected Response:** 200, array of uploaded content

---

### 3️⃣ APPROVAL WORKFLOW TESTS

#### Principal Views Pending Content

```bash
curl -X GET http://localhost:5000/api/approval/pending \
  -H "Authorization: Bearer PRINCIPAL_TOKEN"
```

**Expected Response:** 200, array of pending content with teacher names

---

#### Principal Views All Content

```bash
curl -X GET http://localhost:5000/api/approval/all \
  -H "Authorization: Bearer PRINCIPAL_TOKEN"
```

**Expected Response:** 200, array of all content with teacher names

---

#### Principal Approves Content

```bash
curl -X PUT http://localhost:5000/api/approval/1/approve \
  -H "Authorization: Bearer PRINCIPAL_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:** 200, content with status: "approved"

---

#### Principal Rejects Content

```bash
curl -X PUT http://localhost:5000/api/approval/2/reject \
  -H "Authorization: Bearer PRINCIPAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Invalid file format" }'
```

**Expected Response:** 200, content with status: "rejected"

---

### 4️⃣ PUBLIC BROADCASTING API TESTS (NO AUTH REQUIRED)

#### Get Live Content for Teacher

```bash
curl http://localhost:5000/api/broadcast/live/1
```

**Expected Response:**

- If approved + within time window: `{ message: "Content retrieved successfully", data: { ... } }`
- If no content: `{ message: "No content available", data: null }`

---

#### Get Live Content by Subject

```bash
curl http://localhost:5000/api/broadcast/live/1/maths
```

**Expected Response:** Active maths content or "No content available"

---

#### Get All Live Content by Teacher

```bash
curl http://localhost:5000/api/broadcast/teacher/1
```

**Expected Response:**

- If content exists: `{ data: { "maths": [...], "science": [...] } }`
- If no content: `{ data: {} }`

---

### 5️⃣ EDGE CASE TESTS

#### Invalid Teacher ID

```bash
curl http://localhost:5000/api/broadcast/live/invalid
```

**Expected Response:** `{ message: "No content available", data: null }`

---

#### Content Outside Time Window

Upload content with past times, then call:

```bash
curl http://localhost:5000/api/broadcast/live/1
```

**Expected Response:** `{ message: "No content available", data: null }`

---

#### Subject with No Content

```bash
curl http://localhost:5000/api/broadcast/live/1/nonexistent
```

**Expected Response:** `{ message: "No content available", data: null }`

---

## 🐛 ERROR SCENARIOS

#### Missing Token

```bash
curl http://localhost:5000/api/content/my
```

**Expected:** 401 Unauthorized

#### Teacher trying to approve content

```bash
curl -X GET http://localhost:5000/api/approval/pending \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

**Expected:** 403 Access denied

#### Invalid credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -d '{ "email": "teacher@example.com", "password": "wrong" }'
```

**Expected:** 401 Invalid credentials

---

## 📊 Rotation Logic Test

1. Upload 3 pieces of content for "maths"
2. Approve all 3
3. Set durations via database (add schedule records):
   - Content 1: 5 minutes
   - Content 2: 3 minutes
   - Content 3: 5 minutes
4. Call `/api/broadcast/live/1/maths` multiple times
5. Should rotate between content based on current time

---

## ✨ All Tests Completed Successfully When:

- ✅ All auth endpoints return 200/201
- ✅ Content upload returns 201
- ✅ Approval endpoints work correctly
- ✅ Broadcasting API returns correct content
- ✅ Edge cases handled gracefully (no errors, proper responses)
- ✅ Role-based access control enforced
