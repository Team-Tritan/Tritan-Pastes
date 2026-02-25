# Tritan Pastes

A self-hosted pastebin with AES-256 encryption, password protection, expiration, and syntax highlighting for 23 languages.

**Stack:** Next.js · Drizzle ORM · PostgreSQL 18 · Bun · Docker

## Getting Started

```sh
git clone https://github.com/Team-Tritan/Tritan-Pastes.git
cd Tritan-Pastes
```

Create a `.env` file:

```sh
DATABASE_URL=postgres://tritan:tritan@db:5432/pastes
SECRET_KEY=your-secret-key-here
```

Build and start:

```sh
docker compose up --build
```

The app will be available at `http://localhost:3000`. Database migrations run automatically on startup.

## Features

- AES-256 encrypted paste content
- Optional password protection
- Expiration dates and burn-after-read
- Syntax highlighting (23 languages, detected from file extension)
- File import via drag-and-drop or `Ctrl+O`
- Raw paste endpoint at `/:id/raw`
- CLI-friendly API

## API

**Create a paste**

```sh
curl -X POST http://localhost:3000/api/quick \
  -H "Content-Type: application/json" \
  -d '{"content": "hello world"}'
```

**View raw content**

```sh
curl http://localhost:3000/raw/:id
# Password-protected:
curl http://localhost:3000/raw/:id?p=yourpassword
```
