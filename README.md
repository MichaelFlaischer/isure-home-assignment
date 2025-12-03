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

## Deployment Notes
- **Backend:** Deploy the ASP.NET API to Azure App Service or Azure Container Apps. Set `Cosmos__Endpoint` and `Cosmos__Key` as application settings along with the expected database/container names.
- **Frontend:** Build the Angular app and host it via Azure Static Web Apps or Azure Storage static hosting. Configure `TodoService` base URL (or use environment files) so that it calls the deployed API.
- **CORS:** Update `Program.cs` to include your deployed frontend origin(s) before publishing.

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
