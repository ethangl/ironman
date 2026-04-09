This project now uses a Vite + React Router frontend with a Next-powered API/auth backend.

## Getting Started

Run the frontend and API server in separate terminals:

```bash
pnpm dev
pnpm dev:api
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) for the frontend. The API/auth server runs on [http://127.0.0.1:3000](http://127.0.0.1:3000) and is proxied through Vite during development.

Useful scripts:

- `pnpm dev`: run the Vite frontend
- `pnpm dev:api`: run the Next API/auth server
- `pnpm build`: build the frontend bundle
- `pnpm build:api`: build the API server
- `pnpm preview`: preview the frontend bundle

The remaining Next app surface is intentionally API-only under `src/app/api`.
