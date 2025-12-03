# FlaischerFlow Client

Angular 17 standalone SPA featuring Material-based shells, pagination & filters, and SCSS-branded theming for the isure take-home. This document covers local development, environment configuration, and the production deployment flow.

## Local Development
```powershell
cd client
npm install
npm run start   # ng serve --port 4200
```
- The dev server listens on `http://localhost:4200`.
- The Angular environment defaults to the local API (`apiBaseUrl: 'http://localhost:5080/api'`). `TodoService` automatically appends `/todos`, so no additional configuration is needed when running both projects locally.

## Environment Configuration
```ts
// src/environments/environment.ts
export const environment = {
	production: false,
	apiBaseUrl: 'http://localhost:5080/api'
};

// src/environments/environment.prod.ts
export const environment = {
	production: true,
	apiBaseUrl: 'https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api'
};
```
- **Important:** Keep the value as the API base (without `/todos`). `TodoService` builds the full endpoint via ``${environment.apiBaseUrl}/todos`` internally.
- Update both files via the Angular CLI environment system if you introduce new stages.

## Production Build & Deployment
```powershell
cd client
npm run build
```
- Output location: `dist/client`.
- Deployment target: Azure Storage Static Website (`$web` container).
- Production URL: `https://flaischerflowclient.z39.web.core.windows.net/`.

## API & CORS Expectations
- The SPA consumes `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos` in production.
- Ensure the backend CORS policy only includes `http://localhost:4200` and `https://flaischerflowclient.z39.web.core.windows.net` so browser calls succeed.

## Testing & Quality Gates
- `npm run build` — primary CI gate (TypeScript + template validation).
- `npm run test` — Angular test runner (currently placeholder specs).

For backend details, Azure deployment steps, and automation scripts see the [root README](../README.md).
