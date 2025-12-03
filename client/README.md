# FlaischerFlow Client

The `client/` project hosts the FlaischerFlow Angular SPA that powers the isure home assignment UI. It is built with Angular 17 standalone components, Angular Material, and SCSS.

## Local Development
```bash
cd client
npm install
npm run start    # ng serve --port 4200
```
Point your browser to `http://localhost:4200`. The app expects the backend at `http://localhost:5080/api/todos` (configurable in `src/app/services/todo.service.ts`).

## Production Build
```bash
cd client
npm run build
```
Artifacts are emitted to `dist/` and can be hosted via Azure Static Web Apps, Azure Storage static hosting, or any static site server.

## Testing & Linting
- `npm run test` — executes the Angular test runner (currently no spec files beyond scaffolding).
- `npm run build` — acts as the primary quality gate for CI.

For the complete project overview (backend instructions, scripts, deployment notes), see the root `README.md`.
