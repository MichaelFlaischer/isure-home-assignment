# Todo API Backend

.NET 8 Web API that stores todos in Azure Cosmos DB (`todosdb` / `todos`) and powers the FlaischerFlow Angular UI.

## Base URLs
- **Development:**
  - API root: `http://localhost:5080/api`
  - Todos: `http://localhost:5080/api/todos`
- **Production:**
  - API root: `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api`
  - Todos: `https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos`

## Sample Payload
```json
{
  "title": "My first todo",
  "description": "Created from Angular",
  "isCompleted": false
}
```

## CORS Policy
`Program.cs` registers the `AllowFlaischerFlowOrigins` policy, which **must** include only:
- `http://localhost:4200`
- `https://flaischerflowclient.z39.web.core.windows.net`

Add additional origins only when onboarding another frontend.

## Running Locally
```powershell
cd server
dotnet restore
dotnet run --urls http://localhost:5080
```
Set the following development secrets or environment variables beforehand:
- `Cosmos__Endpoint`
- `Cosmos__Key`
- `Cosmos__DatabaseId=todosdb`
- `Cosmos__ContainerId=todos`

## Smoke Test Script
Execute from the repo root:
```powershell
powershell -ExecutionPolicy Bypass -File .\server\scripts\Test-TodoCrud.ps1
```
Flags:
- `-StartServer:$false` if an instance is already running.
- `-BaseUrl "https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos"` to validate production.

The script builds the API (optional), starts `dotnet run --no-build`, exercises POST → GET → PUT → GET → DELETE → GET(404), prints structured results, and shuts the host down.
