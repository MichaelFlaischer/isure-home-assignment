# FlaischerFlow – isure Home Assignment

FlaischerFlow is a recruiter-ready showcase for the isure take-home: an Angular 17 standalone SPA powered by a .NET 8 Web API, Azure Cosmos DB for NoSQL, and Azure-hosted deployments on both tiers. The experience highlights CRUD workflows, pagination & filters, polished SCSS design, and automation scripts that prove the solution end to end.

📍 **Production Frontend:** `https://flaischerflowclient.z39.web.core.windows.net/`

📍 **Production API:** `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api`

📍 **Todos Endpoint:** `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos`

## 📁 Project Documentation
- [Root README](./README.md)
- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)
- [Server Scripts Documentation](./server/scripts/README.md)

## Highlights & Assignment Fit
- Angular 17 standalone components, signals, Angular Material, and handcrafted SCSS for a modern UI.
- .NET 8 Web API that persists todos in Azure Cosmos DB (`todosdb` / `todos`) with partition key `/id`.
- Full CRUD surface, guard-protected modals, pagination, and mission-control filters (All / In Progress / Done).
- Azure deployments: App Service Linux for the API (port 8080) and Azure Storage Static Website for the SPA.
- Bonus PowerShell scripts for seeding themed data and running automated CRUD smoke tests.

## Tech Stack
| Layer | Details |
| --- | --- |
| Frontend | Angular 17 standalone, TypeScript, Angular Material, SCSS, RxJS |
| Backend | .NET 8, ASP.NET Core minimal hosting, Cosmos DB SDK v3 |
| Data | Azure Cosmos DB for NoSQL – database `todosdb`, container `todos`, partition key `/id` |
| Hosting | Azure App Service (Linux) for API, Azure Storage Static Website for SPA |
| Tooling | npm / Angular CLI, dotnet CLI, Azure extensions for VS Code, PowerShell automation |

## Repository Layout
```
root
├─ README.md
├─ client/            # Angular SPA
├─ server/            # ASP.NET Core Web API
│  └─ scripts/        # Seed + CRUD PowerShell utilities
└─ .github/           # CI (Angular build, lint)
```

## Local Development

### Backend (`/server`)
1. Install [.NET 8 SDK](https://dotnet.microsoft.com/download) and provision an Azure Cosmos DB account (or use the emulator).
2. Configure secrets (user-secrets or environment variables):
   ```powershell
   cd server
   dotnet user-secrets init
   dotnet user-secrets set "Cosmos:Endpoint" "https://<your-account>.documents.azure.com:443/"
   dotnet user-secrets set "Cosmos:Key" "<primary-key>"
   dotnet user-secrets set "Cosmos:DatabaseId" "todosdb"
   dotnet user-secrets set "Cosmos:ContainerId" "todos"
   ```
3. Run locally on port 5080:
   ```powershell
   dotnet restore
   dotnet run --urls http://localhost:5080
   ```
4. Available endpoints during development:
   - `GET http://localhost:5080/api/todos`
   - `POST http://localhost:5080/api/todos`
   - `PUT http://localhost:5080/api/todos/{id}`
   - `DELETE http://localhost:5080/api/todos/{id}`

### Frontend (`/client`)
1. Install Node.js 18+ and Angular CLI 17.
2. Start the SPA:
   ```powershell
   cd client
   npm install
   npm run start   # ng serve --port 4200
   ```
3. Environment guidance:
   ```ts
   // src/environments/environment.ts (dev)
   export const environment = {
     production: false,
     apiBaseUrl: 'http://localhost:5080/api'
   };

   // src/environments/environment.prod.ts (cloud)
   export const environment = {
     production: true,
     apiBaseUrl: 'https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api'
   };
   ```
   `TodoService` appends `/todos` automatically, so you only configure the API base once per environment.
4. Build for production:
   ```powershell
   npm run build
   ```
   Artifacts land in `client/dist/client`.

## PowerShell Automation (`server/scripts`)
| Script | Purpose | Key switches |
| --- | --- | --- |
| `Test-TodoCrud.ps1` | Builds (optional), runs the API, exercises POST→GET→PUT→GET→DELETE→GET(404), reports results. | `-StartServer`, `-BaseUrl` (defaults to `http://localhost:5080/api/todos`) |
| `Seed-IsureTodos.ps1` | Seeds 31 isure-themed todos for demo storytelling. | Same flags as above |

Point `-BaseUrl` at production to validate the deployed API, e.g. `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos`.

## CORS Policy
`Program.cs` registers `AllowFlaischerFlowOrigins` with **exactly**:
- `http://localhost:4200`
- `https://flaischerflowclient.z39.web.core.windows.net`

Add new domains only if another frontend is introduced.

## Deployment Guidance

### Backend – Azure App Service (Linux)
1. `cd server && dotnet publish -c Release -o ./publish`.
2. In VS Code, right-click `server/publish` → **Deploy to Web App** → choose the Linux App Service.
3. App Service listens on port 8080 internally; no manual change required unless you override `ASPNETCORE_URLS`.
4. Required configuration values:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `Cosmos__Endpoint=<production cosmos endpoint>`
   - `Cosmos__Key=<production key>`
   - `Cosmos__DatabaseId=todosdb`
   - `Cosmos__ContainerId=todos`
5. Production base URL: `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api`.

### Frontend – Azure Storage Static Website
1. Run `npm run build` inside `/client`.
2. Upload `client/dist/client` to the Storage account’s `$web` container (or use the Azure Storage deploy extension).
3. Production SPA URL: `https://flaischerflowclient.z39.web.core.windows.net/`.
4. Ensure the backend CORS list matches the static site hostname above.

## Sample API Requests (Production)
```http
GET https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos

POST https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos
Content-Type: application/json

{
  "title": "Prep demo",
  "description": "Walk recruiters through FlaischerFlow",
  "isCompleted": false
}

PUT https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos/{id}

DELETE https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos/{id}
```

## Quality Checklist
- `dotnet build` (server) and `npm run build` (client) pass locally and in CI.
- Pagination, filters, modals, and CRUD flows manually verified against Cosmos DB.
- Cosmos credentials stored outside source control (user-secrets / App Service settings).
- PowerShell scripts documented with production-safe instructions.

## Future Enhancements
- Persist filter + pagination preferences via query params/local storage.
- Add Playwright e2e coverage for the SPA against the hosted API.
- Add Docker Compose for one-command local orchestration.
