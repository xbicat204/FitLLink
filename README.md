# FitLink

FitLink connects students with personal trainers. This repository combines the frontend and backend projects under a new Git history.

## Projects

- `fitlink-frontend/` — React/Vite web client.
- `fitlink-backend/` — Node.js/Express API and MongoDB integration.

## Backend unit tests

```bash
cd fitlink-backend
npm ci
npm test -- --runInBand --coverage
```

Coverage HTML: `fitlink-backend/coverage/lcov-report/index.html`.

The GitHub Actions workflow is in `fitlink-backend/.github/workflows/test.yml` and runs on push and pull requests.

Copy `fitlink-backend/.env.example` to `.env` and fill in local credentials before running the backend. Never commit real credentials.
