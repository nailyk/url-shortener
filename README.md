# URL Shortener

A full-stack URL shortener application built with React (frontend), Express (backend), PostgreSQL, and Redis.  
Supports custom aliases, expiration (analytics TBA)

---

## Features

- Shorten URLs with optional custom aliases
- Set expiration for shortened URLs
- Fast redirects with Redis caching
- REST API with validation
- Dockerized for easy local development

---

![App Home Screen](./resources/homescreen.png)

## Project Structure

```
url-shortener/
├── client/         # React frontend (Vite)
├── server/         # Express backend
├── docker-compose.yml
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- (Optional for local dev) Node.js 18+ and npm

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

---

### 2. Start with Docker Compose

```sh
docker-compose build
docker-compose up
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend/API: [http://localhost:3000](http://localhost:3000)

---

## Database

- PostgreSQL is used for persistent storage.
- Redis is used for caching and short code generation (using REDIS INCR coupled with sqid)
- Database schema is initialized from `server/src/config/db-init.sql`.

---

## Useful Commands

- **Reset database (Docker Compose):**
  ```sh
  docker-compose down -v
  ```
- **Rebuild images:**
  ```sh
  docker-compose build
  ```

---

## Author

[Kylian Deau](https://github.com/nailyk)
