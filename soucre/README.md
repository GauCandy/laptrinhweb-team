# Whitecat2

Node.js skeleton repo with:

- backend API using Express
- frontend web using a small Node static server
- PostgreSQL database schema seed structure

## Structure

```text
src/
  backend/
    config/
    controllers/
    db/
    routes/
  database/
  frontend/
    public/
```

## Scripts

- `npm run dev` starts backend and frontend together
- `npm run dev:backend` starts the API server
- `npm run dev:frontend` starts the web server
- `npm run db:migrate` applies pending database migrations
- `npm run db:migrate:status` shows migration status
- `npm run db:migrate:create -- add_table_name` creates a new migration pair

## Default ports

- API: `API_PORT`, fallback `BACKEND_PORT` or `PORT`, default `8080`
- web: `WEB_PORT`, fallback `FRONTEND_PORT`, default `3000`

## Main env names

- `WEB_URL`: public URL of the frontend
- `API_URL`: base URL the frontend uses to call the backend
- `DATABASE_URL`: PostgreSQL connection string

The code still supports older names like `FRONTEND_PORT`, `BACKEND_PORT`, `BASE_URL`, and `API_BASE_URL` as fallback, but new config should use `WEB_*` and `API_*`.

## Database versioning

Database schema changes are tracked in `src/database/migrations`. Run `npm run db:migrate` to apply pending versions to an existing PostgreSQL database.

## Next step

Replace placeholder routes, UI blocks, and SQL schema with your real app logic.
