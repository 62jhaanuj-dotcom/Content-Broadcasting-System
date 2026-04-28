# Content Broadcasting System Backend

Backend API for a school content broadcasting workflow where:

- teachers upload subject-based content
- principals approve or reject it
- students consume approved live content from public endpoints

This project is built with Node.js, Express, PostgreSQL, JWT authentication, local file uploads, and subject-based rotation logic.

## Overview

The system is designed for educational content distribution without printed copies.

Typical flow:

1. A teacher signs up and logs in.
2. The teacher uploads content with subject, file, and schedule window.
3. The content is stored as `pending`.
4. A principal reviews it.
5. The principal approves or rejects it.
6. Approved content becomes available through public live APIs only when it is inside its active time window.

## Implemented Features

- JWT authentication
- Role-based access control for `teacher` and `principal`
- Password hashing with `bcrypt`
- Image upload with `multer`
- Local file storage
- Approval and rejection workflow
- Subject-based rotation scheduling
- Public live broadcasting API
- Edge-case handling for empty live states
- Centralized error handling
- Rate limiting on `/api/*`

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL / Supabase Postgres |
| Auth | JWT |
| Password Hashing | bcrypt |
| Uploads | multer |
| Security | helmet, CORS, rate limiting |

## Roles

### Teacher

- sign up and log in
- upload content
- view own uploaded content

### Principal

- sign up and log in
- view all uploaded content
- view pending content
- approve content
- reject content with reason

## Content Lifecycle

```text
upload -> pending -> approved / rejected
```

Rules:

- newly uploaded content is stored as `pending`
- only approved content is eligible for public broadcast
- rejected content stores a `rejection_reason`
- approved content still requires a valid schedule window to appear live

## Scheduling Rules

Scheduling is the most important business rule in this project.

- each content item belongs to one subject
- each subject has its own independent rotation
- `rotationDuration` controls how many minutes that content stays active in its subject cycle
- content is considered live only if:
  - status is `approved`
  - `startTime` and `endTime` are both set
  - current time falls between `startTime` and `endTime`

### Important behavior

- if `startTime` and `endTime` are omitted, upload still succeeds
- but that content will never appear in live broadcast until a valid window exists

### Live endpoint behavior

`GET /api/broadcast/live/:teacherId`

- returns one currently active content item for the teacher
- if multiple subjects are active for the same teacher, one active subject is selected at a time
- response includes `rotationInfo`

`GET /api/broadcast/teacher/:teacherId`

- returns grouped live content by subject
- useful when you want the full per-subject live view

## Database Schema Overview

users

Stores all system users (teachers & principals).

id (PK)
name
email (unique)
password_hash
role (teacher, principal)
created_at
updated_at

2. content

Stores uploaded content along with approval and scheduling metadata.

id (PK)
title
description
subject
file_path
file_type
file_size
uploaded_by (FK → users.id)
status (pending, approved, rejected)
start_time
end_time
approved_by (FK → users.id)
approved_at
rejection_reason
created_at
updated_at

3. content_slots

Represents subject-wise slots for rotation.

id (PK)
subject
created_at
updated_at

4. schedule

Handles rotation logic for content inside each subject slot.

id (PK)
content_id (FK → content.id)
slot_id (FK → content_slots.id)
rotation_order
duration (in minutes)
created_at
updated_at
### Relationships

- one teacher can upload many content items
- one principal can approve many content items
- one subject slot can contain many scheduled items
- one content item maps to one schedule row

## Project Structure

```text
src/
  config/
    db.js
    env.js
  controllers/
    approvalController.js
    authController.js
    broadcastController.js
    contentController.js
  middlewares/
    authMiddleware.js
    errorMiddleware.js
    roleMiddleware.js
    uploadMiddleware.js
  models/
    contentModel.js
    contentSlotModel.js
    scheduleModel.js
    userModel.js
  routes/
    approvalRoutes.js
    authRoutes.js
    broadcastRoutes.js
    contentRoutes.js
  services/
    authService.js
    schedulingService.js
server.js
```

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_DB_URL=postgresql://user:password@host:port/database
DB_SSL=false

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
MAX_FILE_SIZE=10485760

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Notes:

- `DATABASE_URL` is the preferred key
- `SUPABASE_DB_URL` is still supported for backward compatibility
- in production, SSL is enabled by default unless configured otherwise

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

3. Make sure your PostgreSQL / Supabase database already contains the required tables

4. Start the server

```bash
npm run dev
```

or

```bash
npm start
```

## Authentication Rules

### Sign Up

`POST /api/auth/signup`

Required fields:

- `name`
- `email`
- `password`
- `role`

Validation rules:

- `name` cannot be blank
- `email` must be valid
- `password` must be at least 6 characters after trimming
- spaces-only passwords are rejected
- `role` must be exactly `teacher` or `principal`

Example:

```json
{
  "name": "Teacher One",
  "email": "teacher1@mail.com",
  "password": "Password123",
  "role": "teacher"
}
```

### Login

`POST /api/auth/login`

Required fields:

- `email`
- `password`

Example response:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Teacher One",
    "email": "teacher1@mail.com",
    "role": "teacher"
  }
}
```

## Upload Rules

`POST /api/content/upload`

Required:

- `title`
- `subject`
- `file`

Optional:

- `description`
- `startTime`
- `endTime`
- `rotationDuration`

Validation rules:

- file must be `jpg`, `png`, or `gif`
- max file size is `10MB`
- `startTime` and `endTime` must be provided together
- `endTime` must be later than `startTime`
- `rotationDuration` must be a positive number

## Rate Limiting

Rate limiting is implemented on all `/api/*` routes.

Current behavior:

- controlled by `RATE_LIMIT_WINDOW_MS`
- controlled by `RATE_LIMIT_MAX_REQUESTS`
- returns a friendly error message when the limit is exceeded

Implementation reference:

- `express-rate-limit` middleware is mounted in `src/app.js`

## API Summary

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Teacher Content

- `POST /api/content/upload`
- `GET /api/content/my`
- `GET /api/content/:id`

### Principal Approval

- `GET /api/approval/all`
- `GET /api/approval/pending`
- `PUT /api/approval/:id/approve`
- `PUT /api/approval/:id/reject`

### Public Broadcast

- `GET /api/broadcast/live/:teacherId`
- `GET /api/broadcast/live/:teacherId/:subject`
- `GET /api/broadcast/live/:teacherId?subject=maths`
- `GET /api/broadcast/teacher/:teacherId`

Assignment-style alias:

- `GET /content/live/teacher-1`
- `GET /content/live/teacher-1/maths`

Broadcast endpoints accept either:

- numeric teacher ID like `1`
- alias format like `teacher-1`

## Public API Examples

### Health Check

```http
GET /
```

Response:

```json
{
  "message": "Content Broadcast API is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

### Teacher Live Content

```http
GET /api/broadcast/live/teacher-1
```

Example response:

```json
{
  "message": "Content retrieved successfully",
  "data": {
    "id": 10,
    "title": "Maths Test 1",
    "subject": "maths",
    "status": "approved"
  },
  "rotationInfo": {
    "totalDuration": 8,
    "currentSlot": 2,
    "contentDuration": 5,
    "rotationOrder": 1,
    "subject": "maths",
    "activeSubjectCount": 2
  }
}
```

If nothing is live:

```json
{
  "message": "No content available",
  "data": null
}
```

### Teacher Live Content By Subject

```http
GET /api/broadcast/live/teacher-1/maths
```

If nothing is live for that subject:

```json
{
  "message": "No content available",
  "data": null
}
```

### Teacher Grouped Live View

```http
GET /api/broadcast/teacher/1
```

Example response:

```json
{
  "message": "Content retrieved successfully",
  "data": {
    "maths": {
      "content": {
        "id": 10,
        "title": "Maths Test 1",
        "subject": "maths",
        "status": "approved"
      },
      "rotationInfo": {
        "totalDuration": 8,
        "currentSlot": 2,
        "contentDuration": 5,
        "rotationOrder": 1
      }
    },
    "science": {
      "content": {
        "id": 12,
        "title": "Science Poster",
        "subject": "science",
        "status": "approved"
      },
      "rotationInfo": {
        "totalDuration": 5,
        "currentSlot": 2,
        "contentDuration": 5,
        "rotationOrder": 1
      }
    }
  }
}
```

## Error Handling

The API returns structured errors for common failures:

- `400` bad input
- `401` invalid or missing auth
- `403` forbidden access
- `404` missing resource
- `409` duplicate email
- `500` internal server error

Example:

```json
{
  "message": "Password must be at least 6 characters",
  "status": "error",
  "code": "INTERNAL_ERROR"
}
```

Note:

- many validation failures return a simple `{ "message": "..." }` response directly from controllers
- centralized middleware handles shared runtime errors and maps them to structured responses

## Edge Cases Handled

- invalid teacher ID returns empty live result
- invalid subject returns empty live result
- approved but inactive content is not shown
- pending or rejected content is never exposed publicly
- missing upload file is rejected
- wrong file type is rejected
- spaces-only password is rejected

## Security Notes

- passwords are hashed with bcrypt
- JWT is required for protected routes
- role-based authorization is enforced
- uploads are type and size validated
- public APIs are rate limited

## Postman Collection

An importable Postman collection is included:

[content-broadcasting-system.postman_collection.json](./content-broadcasting-system.postman_collection.json)

It includes:

- signup and login flow
- upload flow
- approval flow
- public API verification
- invalid signup password test

## Final Notes

This project focuses on correctness, business logic, clear structure, and practical backend behavior rather than distributed complexity.

Implemented optional improvement:

- rate limiting

Not implemented as core features:

- Redis caching
- S3 uploads
- analytics
- pagination

