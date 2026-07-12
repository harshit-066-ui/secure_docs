# Secure Cloud Document Management System

A full-stack document management application built with React, Node.js, Express, Supabase, and Amazon S3.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth (JWT) |
| File Storage | Amazon S3 (AWS SDK v3) |

## Project Structure

```
intern_project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js      # Supabase client setup
│   │   │   └── s3.js            # AWS S3 client setup
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── documentController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   └── index.js
│   │   ├── services/
│   │   │   ├── s3Service.js         # S3 upload, download, delete, presigned URLs
│   │   │   └── supabaseService.js   # Auth & document metadata
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── supabase/
│   ├── schema.sql
│   └── migration_s3.sql
└── README.md
```

## Upload Flow

```
React Frontend
      │
      ▼
Express Backend  (JWT auth + file validation)
      │
      ▼
AWS IAM Authenticated Request
      │
      ▼
Amazon S3 Bucket
      │
      ▼
Supabase PostgreSQL  (document metadata: s3_key, filename, file_size)
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) account
- An [AWS](https://aws.amazon.com/) account with S3 access

## Required Dependencies

Install these manually before running the project.

### Backend

Existing dependencies (Express, Supabase, multer, etc.) plus:

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Frontend

No additional packages required for S3 integration. AWS credentials stay on the backend only.

## AWS Configuration

### 1. Create an S3 Bucket

1. Open the [AWS S3 Console](https://s3.console.aws.amazon.com/).
2. Click **Create bucket**.
3. Choose a unique bucket name and region.
4. Block all public access (recommended).
5. Create the bucket.

### 2. Create IAM Credentials

1. Open [IAM → Users](https://console.aws.amazon.com/iam/).
2. Create a user with programmatic access.
3. Attach a policy that allows S3 access to your bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Save the **Access Key ID** and **Secret Access Key**.

### 3. Configure CORS (optional)

If you need direct browser access to presigned URLs from a different origin, add a CORS configuration on the bucket. For this app, downloads use presigned URLs returned by the backend, so default settings are usually sufficient.

## Supabase Setup

### 1. Create a Project

1. Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run Database Schema

**New project:** run `supabase/schema.sql` in the SQL Editor.

**Existing project (migrating from Supabase Storage):** run `supabase/migration_s3.sql`.

### 3. Configure Authentication

1. Enable the **Email** provider under **Authentication → Providers**.
2. Set Site URL to `http://localhost:5173`.
3. Add redirect URL: `http://localhost:5173/**`.
4. Optionally disable email confirmation for local testing.

### 4. Get API Keys

From **Project Settings → API**, copy:

- Project URL → `SUPABASE_URL`
- anon public key → `SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_KEY` (backend only)

## Environment Variables

### Backend (`backend/.env`)

Copy from `.env.example`:

```env
PORT=5000
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region where the S3 bucket lives |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | IAM access key (backend only) |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key (backend only) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) |

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

Never put AWS credentials in the frontend.

## Running the Project

After installing dependencies manually:

**Terminal 1 — Backend:**

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

Visit `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/signup` | No | Register a user |
| POST | `/api/auth/login` | No | Log in |
| POST | `/api/auth/logout` | Yes | Log out |
| GET | `/api/documents` | Yes | List user documents |
| POST | `/api/documents/upload` | Yes | Upload a document to S3 |
| GET | `/api/documents/:id/download` | Yes | Get presigned download URL |
| DELETE | `/api/documents/:id` | Yes | Delete S3 object and metadata |

All protected routes require `Authorization: Bearer <jwt_token>`.

## Security Notes

- AWS credentials are read from environment variables on the backend only.
- File type and size (max 10 MB) are validated before upload.
- Only authenticated users can upload, download, or delete documents.
- Users can only access their own documents (enforced by JWT + user_id checks).
- Presigned URLs expire after 1 hour.

## Allowed File Types

PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, GIF, XLS, XLSX, CSV

## License

MIT
