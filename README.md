# FlaischerFlow - isure Home Assignment

FlaischerFlow is a polished full-stack Todo experience crafted specifically for the isure take-home. It pairs a .NET 8 Web API backed by Azure Cosmos DB with an Angular 17 standalone frontend that leans on modern signals, Angular Material, and custom SCSS branding.

## Feature Checklist
- Create, edit, delete, and toggle todo items via Cosmos-backed REST endpoints.
- Mission control filters (All / In Progress / Done) with live counters and pagination.
- Modal-driven create/update workflow plus guarded delete confirmations.
- Responsive, FlaischerFlow-branded UI with hero, toolbar, list, paginator, and footer.
- Bonus automation scripts for CRUD smoke tests and seeding isure-themed tasks.

## Tech Stack
| Layer    | Details |
|----------|---------|
| Backend  | .NET 8 Web API, ASP.NET Core controllers, Azure Cosmos DB SDK |
| Database | Azure Cosmos DB for NoSQL (database `todosdb`, container `todos`, partition key `/id`) |
| Frontend | Angular 17 standalone components, signals, Angular Material, SCSS |
| Tooling  | PowerShell automation scripts, npm scripts, dotnet CLI |

## Repository Layout
```
root
 README.md          # You are here
 server/            # ASP.NET Core Web API (Cosmos integration)
    scripts/       # PowerShell automation (CRUD test, seed data)
 client/            # Angular 17 SPA (FlaischerFlow UI)
```

## Backend Setup (`/server`)
1. **Prerequisites:** .NET 8 SDK and access to an Azure Cosmos DB account (or the local emulator).
2. **Configure Cosmos credentials (never commit secrets):**
   ```bash
   cd server
   dotnet user-secrets init
   dotnet user-secrets set "Cosmos:Endpoint" "https://<your-account>.documents.azure.com:443/"
   dotnet user-secrets set "Cosmos:Key" "<primary-key>"
   ```
   Alternatively export `Cosmos__Endpoint` / `Cosmos__Key` environment variables.
3. **Run the API:**
   ```bash
   dotnet restore
   dotnet run --urls http://localhost:5080
   ```
   The service exposes `GET/POST/PUT/DELETE` under `http://localhost:5080/api/todos` and sets `createdAt` automatically when new todos are stored.
4. **Verify with the CRUD smoke test (optional but recommended):**
   ```powershell
   # from the repo root
   powershell -ExecutionPolicy Bypass -File .\server\scripts\Test-TodoCrud.ps1
   ```
   The script builds the project, launches `dotnet run --no-build`, exercises POST -> GET -> PUT -> GET -> DELETE -> GET(404), prints results, and shuts the host down.

## Frontend Setup (`/client`)
1. **Prerequisites:** Node.js 18+ (with npm) and the Angular CLI (`npm install -g @angular/cli`).
2. **Install & serve:**
   ```bash
   cd client
   npm install
   npm run start   # equivalent to ng serve --port 4200
   ```
3. **Configure API base URL:** The UI talks to `http://localhost:5080/api/todos` by default (see `src/app/services/todo.service.ts`). Adjust this constant or add an environment-specific proxy if your backend runs elsewhere.
4. **Build for production:**
   ```bash
   npm run build
   ```
   The output lands in `client/dist/` and can be hosted behind any static web server or Azure Static Web App.

## Bonus PowerShell Scripts (`server/scripts`)
| Script | Purpose | How to run |
|--------|---------|------------|
| `Test-TodoCrud.ps1` | Builds + runs the API locally and executes a full CRUD smoke test. | `powershell -ExecutionPolicy Bypass -File .\server\scripts\Test-TodoCrud.ps1 [-StartServer:$false]` |
| `Seed-IsureTodos.ps1` | Populates Cosmos with 31 humorous, mission-themed todos spanning the entire isure journey. | `powershell -ExecutionPolicy Bypass -File .\server\scripts\Seed-IsureTodos.ps1 [-StartServer:$true]` |

Both scripts accept `-BaseUrl` if you need to point at a different environment.

## Deployment

### Backend – Azure App Service (`server/`)
1. **Publish locally:**
   ```bash
   cd server
   dotnet restore
   dotnet publish -c Release -o ./publish
   ```
   The `publish/` folder contains everything needed for App Service.
2. **Deploy:**
   - *VS Code Azure App Service extension*: Right-click `publish/` ➜ **Deploy to Web App** ➜ choose the `flaischerflow-api` Linux App Service ➜ confirm zip deploy.
   - *Deployment Center (GitHub Actions)*: In the Azure Portal, open the App Service ➜ **Deployment Center** ➜ connect GitHub ➜ select this repo and branch ➜ the portal generates a workflow that builds via `dotnet publish` and deploys on every push.
3. **App Service settings (Configuration ➜ Application settings):**
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `Cosmos__Endpoint=https://<your-cosmos-account>.documents.azure.com:443/`
   - `Cosmos__Key=<primary-key>`
   - `Cosmos__DatabaseId=todosdb`
   - `Cosmos__ContainerId=todos`
   - (Optional) `ASPNETCORE_URLS=http://+:8080` if you want to pin the Kestrel port.
4. **CORS:** `Program.cs` registers the `AllowFlaischerFlowOrigins` policy to permit `http://localhost:4200` and `https://flaischerflow-web.azurestaticapps.net`. If you host the SPA elsewhere, add the new origin to this policy.
5. **Result:** The API is reachable at `https://flaischerflow-api.azurewebsites.net/api/todos` and continues to expose the same CRUD surface, including automatic `createdAt` stamping.

### Frontend – Azure Static Web Apps (`client/`)
1. **Resource:** Create an Azure Static Web App that points to this GitHub repo. Use `client` for **App location**, leave **API location** blank, and set **Output location** to `dist/client`.
2. **Workflow:** The repo includes `.github/workflows/flaischerflow-static-web-app.yml`, which:
   - Triggers on pushes to `main`.
   - Uses Node.js 18, runs `npm ci`, then `npm run build` inside `/client`.
   - Uploads `dist/client` via `Azure/static-web-apps-deploy@v1` using the `STATIC_WEB_APPS_API_TOKEN` secret.
3. **API URL configuration:** `src/environments/environment.ts` targets `http://localhost:5080/api`, while `environment.prod.ts` targets `https://flaischerflow-api.azurewebsites.net/api`. `TodoService` appends `/todos` at runtime, so updating the API host only requires editing the relevant environment file.
4. **CORS reminder:** Ensure the backend continues to allow the Static Web App hostname exactly as printed in the Azure portal (e.g., `https://flaischerflow-web.azurestaticapps.net`).

### Post-Deployment Verification
1. Browse to `https://flaischerflow-web.azurestaticapps.net`.
2. Confirm the todo list loads from Cosmos via the cloud API.
3. Create, edit, complete, and delete todos to verify persistence.
4. (Optional) Run the CRUD script against production:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server\scripts\Test-TodoCrud.ps1 -BaseUrl "https://flaischerflow-api.azurewebsites.net/api/todos" -StartServer:$false
   ```
   > ⚠️ This seeds and deletes live data; only run it if the production database is safe to modify.

## Verification & Quality Checklist
- `cd server && dotnet build`  succeeds with nullable warnings treated by the SDK defaults.
- `cd client && npm run build`  produces an optimized Angular bundle.
- Filters, pagination, modals, and CRUD flows were manually tested in the FlaischerFlow UI.
- No Cosmos secrets are committed; configuration flows through appsettings + overrides.
- Bonus scripts documented and aligned with current API endpoints/payloads.

## Future Enhancements
- Persist pagination/filter preferences per user via query params.
- Add e2e tests (e.g., Playwright) that exercise the Angular UI against the live API.
- Containerize both apps with Docker and add a simple `docker-compose` for local orchestration.
