#  Content Broadcast System - Backend API

> A modern backend system for distributing educational content to students with teacher-controlled scheduling and principal-managed approvals.

##  Quick Overview

Teachers upload subject-based educational content  Principals approve it  System broadcasts via public API with rotation scheduling  Students access content within defined time windows.

---

##  Features

 **JWT Authentication** - Secure token-based auth with role-based access  
 **Role-Based Access Control** - Teacher & Principal roles with strict permissions  
 **Content Upload** - JPG/PNG/GIF images with metadata tracking  
 **Approval Workflow** - Content goes through pending  approved/rejected states  
 **Subject-Based Rotation** - Independent rotation schedule per subject  
 **Time-Window Scheduling** - Content visible only within teacher-defined periods  
 **Public Broadcasting API** - Students access approved content via stateless endpoints  
 **Error Handling** - Centralized error middleware with structured responses  
 **Input Validation** - Comprehensive validation at all endpoints

---

##  Tech Stack

| Component      | Technology                |
| -------------- | ------------------------- |
| Runtime        | Node.js (v16+)            |
| Framework      | Express.js 5.x            |
| Database       | PostgreSQL (via Supabase) |
| Authentication | JWT + bcrypt              |
| File Upload    | Multer (local storage)    |
| Environment    | Dotenv                    |

---

##  Installation & Setup

### 1. Prerequisites

- Node.js v16+ installed
- PostgreSQL database (local or Supabase)
- npm or yarn

### 2. Clone & Install

```bash
git clone <repo-url>
cd content-broadcast-backend
npm install
```

### 3. Database Setup

#### Option A: PostgreSQL (Local)

```bash
psql -U postgres -h localhost
CREATE DATABASE content_broadcast;
```

#### Option B: Supabase (Cloud)

Create project at https://supabase.com and get connection string

### 4. Initialize Schema

```bash
# Connect to your database
psql -U postgres -d content_broadcast < src/config/schema.sql

# Or use SQL client to run: src/config/schema.sql
```

### 5. Environment Variables

Create `.env` file in root:

```env
PORT=5000
NODE_ENV=development

# Database (Supabase format)
SUPABASE_DB_URL=postgresql://user:password@host:port/database

# JWT Secret (use strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 6. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Expected output:

```
 DB Connected
 Server running on port 5000
```

---

##  API Documentation

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Teacher",
  "email": "john@school.com",
  "password": "Password123",
  "role": "teacher"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Teacher",
    "email": "john@school.com",
    "role": "teacher"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@school.com",
  "password": "Password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Teacher",
    "email": "john@school.com",
    "role": "teacher"
  }
}
```

---

### Content Management (Teacher)

#### Upload Content

```http
POST /api/content/upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Fields:
  - title: "Question Paper Chapter 5" (required)
  - subject: "maths" (required)
  - file: <image.jpg> (required, max 10MB)
  - description: "Important questions" (optional)
  - startTime: "2026-04-27T10:00:00Z" (optional)
  - endTime: "2026-04-27T12:00:00Z" (optional)
  - rotationDuration: 5 (optional, minutes, default 5)
```

**Response (201):**

```json
{
  "message": "Content uploaded successfully",
  "data": {
    "id": 5,
    "title": "Question Paper Chapter 5",
    "subject": "maths",
    "file_path": "src/uploads/1698765432123.jpg",
    "file_type": "image/jpeg",
    "file_size": 2048576,
    "uploaded_by": 1,
    "status": "pending",
    "start_time": "2026-04-27T10:00:00Z",
    "end_time": "2026-04-27T12:00:00Z",
    "created_at": "2026-04-26T14:30:00Z",
    "schedule": {
      "slot_id": 1,
      "rotation_order": 1,
      "duration": 5
    }
  }
}
```

#### Get My Content

```http
GET /api/content/my
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**

```json
{
  "message": "Content retrieved successfully",
  "data": [
    {
      "id": 5,
      "title": "Question Paper Chapter 5",
      "subject": "maths",
      "status": "pending",
      "created_at": "2026-04-26T14:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Approval Workflow (Principal)

#### View Pending Content

```http
GET /api/approval/pending
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**

```json
{
  "message": "Pending content retrieved",
  "data": [
    {
      "id": 5,
      "title": "Question Paper Chapter 5",
      "subject": "maths",
      "status": "pending",
      "teacher_name": "John Teacher",
      "created_at": "2026-04-26T14:30:00Z"
    }
  ],
  "count": 1
}
```

#### Approve Content

```http
PUT /api/approval/{id}/approve
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**

```json
{
  "message": "Content approved successfully",
  "data": {
    "id": 5,
    "status": "approved",
    "approved_by": 2,
    "approved_at": "2026-04-26T15:45:00Z"
  }
}
```

#### Reject Content

```http
PUT /api/approval/{id}/reject
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "reason": "Image quality is poor. Please resubmit with high-resolution image."
}
```

**Response (200):**

```json
{
  "message": "Content rejected successfully",
  "data": {
    "id": 5,
    "status": "rejected",
    "rejection_reason": "Image quality is poor..."
  }
}
```

---

### Broadcasting (Public API - No Auth)

#### Get Live Content for Teacher

```http
GET /api/broadcast/live/1
```

Assignment-style alias also works:

```http
GET /content/live/teacher-1
```

**Response (200):**

```json
{
  "message": "Content retrieved successfully",
  "data": {
    "id": 5,
    "title": "Question Paper Chapter 5",
    "subject": "maths",
    "file_path": "src/uploads/1698765432123.jpg",
    "status": "approved"
  },
  "rotationInfo": {
    "totalDuration": 15,
    "currentSlot": 7,
    "contentDuration": 5
  }
}
```

#### Get Live Content by Subject

```http
GET /api/broadcast/live/1/maths
```

Assignment-style alias also works:

```http
GET /content/live/teacher-1/maths
```

#### Get All Live Content by Teacher

```http
GET /api/broadcast/teacher/1
```

**Response (200):**

```json
{
  "message": "Content retrieved successfully",
  "data": {
    "maths": [
      {
        "id": 5,
        "title": "Question Paper Chapter 5",
        "status": "approved"
      },
      {
        "id": 6,
        "title": "Formula Sheet",
        "status": "approved"
      }
    ],
    "science": [
      {
        "id": 7,
        "title": "Periodic Table",
        "status": "approved"
      }
    ]
  }
}
```

---

##  Content Lifecycle

```
1. UPLOAD
   Teacher uploads content  status = "pending"
   Content visible only to teacher & principal

2. PENDING
   Principal reviews in /api/approval/pending

3a. APPROVED (Content goes live)
    - Status: "approved"
    - Approver tracked: approved_by
    - Timestamp tracked: approved_at
    - Becomes eligible for broadcasting
    - Respects start_time  end_time window

3b. REJECTED (Content archived)
    - Status: "rejected"
    - Reason stored: rejection_reason
    - NOT shown in broadcast API
    - Reason visible to teacher
```

---

##  Rotation Logic

### How Subject-Based Rotation Works

Each subject has its own independent rotation cycle:

```
Maths Rotation (Total: 13 minutes):
 Content A: 0-5 min (5 min duration)
 Content B: 5-10 min (5 min duration)
 Content C: 10-13 min (3 min duration)
    cycles back to Content A

Science Rotation (Independent):
 Content X: 0-7 min (7 min duration)
 Content Y: 7-12 min (5 min duration)
    cycles back to Content X
```

**Algorithm:**

```
current_time_minutes = floor(Date.now() / 60000)
current_position = current_time_minutes % total_cycle_duration

For each content in order:
  If current_position < cumulative_duration:
     This content is ACTIVE
  cumulative_duration += content_duration
```

---

##  Configuration

### Allowed File Formats

- JPG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)

### File Size Limit

- Maximum: **10MB**

### Time Format

- ISO 8601: `2026-04-27T10:00:00Z`
- Always in UTC

---

##  Security Features

 **Password Hashing** - bcrypt with 10 salt rounds  
 **JWT Tokens** - 7-day expiry, signed with secret key  
 **SQL Injection Prevention** - Parameterized queries  
 **Input Validation** - All endpoints validate input  
 **Role-Based Access** - Strict permission checks  
 **Error Handling** - No sensitive data exposed

---

##  Testing with cURL

### Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Teacher",
    "email": "john@school.com",
    "password": "Password123",
    "role": "teacher"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@school.com",
    "password": "Password123"
  }'
```

### Upload Content

```bash
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Question Paper" \
  -F "subject=maths" \
  -F "startTime=2026-04-27T10:00:00Z" \
  -F "endTime=2026-04-27T12:00:00Z" \
  -F "file=@/path/to/image.jpg"
```

### Get Live Content (Public)

```bash
curl http://localhost:5000/api/broadcast/live/1
```

---

##  Troubleshooting

### "DB Connection Failed"

- Check database URL in `.env`
- Ensure PostgreSQL is running
- Verify network connection to Supabase

### "Invalid token"

- Ensure token is in Authorization header
- Token format: `Bearer <token>`
- Check token expiry (7 days)

### "File too large"

- Max file size is 10MB
- Compress image if needed

### "Only jpg/png/gif allowed"

- Check file format
- Use .jpg, .png, or .gif extensions

---

##  Project Structure

```
src/
 config/
    db.js              # Database connection
    env.js             # Environment config
    schema.sql         # Database schema
 models/                # Database queries
    userModel.js
    contentModel.js
    scheduleModel.js
    contentSlotModel.js
 controllers/           # Business logic
    authController.js
    contentController.js
    approvalController.js
    broadcastController.js
 services/              # Complex logic
    authService.js
    schedulingService.js
 routes/                # API routes
    authRoutes.js
    contentRoutes.js
    approvalRoutes.js
    broadcastRoutes.js
 middlewares/           # Request interceptors
    authMiddleware.js
    errorMiddleware.js
    roleMiddleware.js
    uploadMiddleware.js
 uploads/               # Uploaded files
 app.js                 # Express app
 server.js              # Entry point
```

---

##  Deployment

### Prepare for Production

1. Change `JWT_SECRET` to strong random key
2. Set `NODE_ENV=production`
3. Use managed PostgreSQL database
4. Set up file backup strategy
5. Enable HTTPS
6. Add rate limiting (future)

### Deploy to Render


##  API Response Format

### Success Response

```json
{
  "message": "Descriptive success message",
  "data": {},
  "count": 1
}
```

### Error Response

```json
{
  "message": "Descriptive error message",
  "status": "error",
  "code": "ERROR_CODE"
}
```

---

##  Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes with meaningful commits
3. Push to branch: `git push origin feature/xyz`
4. Submit Pull Request

---

##  License

MIT License - See LICENSE file

---

##  Author

**GrubPac - Educational Content Broadcast Team**

---

##  FAQ

**Q: Can teachers change content after uploading?**  
A: Currently, not directly. Re-upload with different content, and reject the old one.

**Q: How long does approval take?**  
A: Instantly when principal clicks approve.

**Q: Can content be visible to multiple subjects?**  
A: No, each content belongs to one subject only.

**Q: What happens if multiple teachers upload to same subject?**  
A: Each teacher's content is independent, public API shows teacher-specific content only.

**Q: Is there a limit on content uploads?**  
A: No, but each file is limited to 10MB.

---

**Need Help?** Check `architecture-notes.txt` for detailed system design.
