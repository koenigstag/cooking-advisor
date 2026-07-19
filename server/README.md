# Cooking Advisor — Recipe Library Server

NestJS server exposing a shared recipe library. No authentication yet.

## Run

```bash
npm install
npm run build
npm run start        # or start:dev for watch mode
```

Listens on `PORT` (default `3001`).

## API

- `GET /recipes` — list all library recipes
- `POST /recipes` — add a recipe to the library

## Storage

Recipes are stored in `data/recipes.json` (created on first write, git-ignored).

## TODO

- Consider migrating storage from a flat JSON file to SQLite once querying/
  concurrent-write needs grow beyond what a single JSON array comfortably
  handles (e.g. once auth/users land and recipes need per-user ownership).
