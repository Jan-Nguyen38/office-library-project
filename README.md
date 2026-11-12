# Office Template Library

A library of Vietnamese office document templates (leave requests, labour contracts, meeting minutes, quotes, CVs…). Users browse and search templates, preview them, create their own copy, fill in the blanks in a rich-text editor, then download it as Word/HTML, print it, or share a read-only link.

| Part | Stack |
| --- | --- |
| `backend/` | NestJS 12, MongoDB (Mongoose), mammoth (DOCX → HTML), html-to-docx (HTML → DOCX) |
| `frontend/` | Next.js 14 (App Router), Ant Design 6, Tiptap 2 editor |

## Features

- **Browse & search** templates by category, with accent-insensitive keyword search (`nghi phep` matches `nghỉ phép`), grid/list views and pagination.
- **Preview** a template rendered from its `.docx`, keeping paragraph alignment and underline, with blanks such as `[Họ và tên]` highlighted.
- **Upload** new templates (`.docx` + optional thumbnail image).
- **Documents**: "Use template" creates an editable copy. The editor has formatting tools, a *Fill in blanks* panel that replaces every `[Label]` with one value, a filled-result preview, Ctrl+S saving and an unsaved-changes guard.
- **Export**: Word (`.docx`, generated on the server), HTML, Print / PDF.
- **Share**: create or revoke a public read-only link (`/share/<id>`).

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB instance (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then edit if needed
npm run start:dev        # http://localhost:8080
```

`backend/.env`:

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | HTTP port (defaults to 3000 if unset) |
| `MONGODB_URI` | `mongodb://localhost:27017/template-library` | MongoDB connection string |

On start the backend inserts any of the 7 built-in templates from `src/modules/templates/seed.ts` that are missing (matched by `filePath`). Existing and uploaded templates are left untouched.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # then set NEXT_PUBLIC_BACKEND_URL (required)
npm run dev              # http://localhost:3000
```

`frontend/.env`:

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8080` | **Required.** Backend API base URL, no trailing slash. Must match the backend's `PORT` |

> `.env.example` ships with this value empty. If you leave it blank, every API call fails and the app shows its "Can not connect to server" error page. Next.js reads the value when the dev server starts or the app is built, so restart `npm run dev` (or rebuild) after changing it.

Run the backend on a port other than 3000 (e.g. 8080 as above) so it doesn't clash with Next.js.

### Debugging in VS Code

`.vscode/launch.json` has a **Debug Backend + Frontend** compound configuration that starts both apps.

## Project structure

```
backend/
  public/
    templates/         .docx files (seeded + uploaded), served statically
    thumbnails/        thumbnail images, served statically
  src/
    main.ts            bootstrap: static files, validation, CORS
    app.module.ts      Mongo connection, global response interceptor
    core/              TransformInterceptor: wraps every response as { statusCode, message, data }
    modules/
      templates/       template CRUD, upload, search, DOCX → HTML conversion, seed data
      documents/       user documents, Word export, share links
frontend/
  src/
    app/               routes: /, /templates/[id], /templates/new, /documents, /documents/[id], /share/[shareId]
    components/        library UI, editor, toolbar, fill-blanks panel, previews
    utils/api.ts       fetch wrapper (unwraps `data`, throws ApiError)
```

## API

Every response has the shape `{ statusCode, message, data }`.

### Templates

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/templates?current=1&pageSize=8&q=&category=` | Paginated list → `{ total, results }` |
| `GET` | `/templates/categories` | Distinct category names |
| `GET` | `/templates/categories/counts?q=` | `{ [category]: count }` for the current keyword |
| `GET` | `/templates/:id` | One template |
| `GET` | `/templates/:id/content` | Template converted to HTML → `{ html }` |
| `POST` | `/templates` | Create from JSON (file already in `public/`) |
| `POST` | `/templates/upload` | Multipart: `file` (.docx, required), `thumbnail` (image), `name`, `category`, `description`, `tags` (comma-separated). 10 MB limit |
| `PATCH` / `DELETE` | `/templates/:id` | Not implemented yet (stubs) |

### Documents

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/documents` | `{ templateId }` → creates a copy → `{ _id }` |
| `GET` | `/documents` | All documents, newest edit first (without content) |
| `GET` | `/documents/:id` | One document |
| `PATCH` | `/documents/:id` | `{ title?, content? }` |
| `DELETE` | `/documents/:id` | Delete |
| `GET` | `/documents/:id/download` | Download as `.docx` |
| `POST` | `/documents/:id/share` | Create (or return the existing) share link → `{ shareId }` |
| `DELETE` | `/documents/:id/share` | Revoke the share link |
| `GET` | `/documents/shared/:shareId` | Public read-only view → `{ title, content, updatedAt }` |

## Template blanks

In a `.docx` template, write blanks in square brackets:

- `[Họ và tên]`, `[Tên công ty]`: **named** blanks. The editor's *Fill in blanks* panel asks for each label once and fills every occurrence.
- `[..]`, `[___]`: **unnamed** blanks, which the user types over directly in the document.

## Scripts

| Where | Command | Purpose |
| --- | --- | --- |
| backend | `npm run start:dev` | Dev server with watch |
| backend | `npm run build` / `npm run start:prod` | Production build / run |
| backend | `npm run lint` | oxlint |
| backend | `npm test` / `npm run test:e2e` | Jest unit / e2e tests |
| frontend | `npm run dev` | Next.js dev server |
| frontend | `npm run build` / `npm start` | Production build / run |
| frontend | `npm run lint` | ESLint |

## Known limitations

- No authentication: anyone who can reach the API can list, edit and delete every document.
- Updating and deleting templates isn't implemented.
