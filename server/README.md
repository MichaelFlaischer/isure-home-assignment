# Todo API Backend

## Backend API
- Base URL (Development): `http://localhost:5080`
- Todos endpoint: `http://localhost:5080/api/todos`
- Sample payload when creating a todo:

```json
{
  "title": "My first todo",
  "description": "Created from Angular",
  "isCompleted": false
}
```

The Angular client that will run at `http://localhost:4200` (and the fallback `http://localhost:4201`) can already call this backend because CORS is configured to allow those origins.

## Smoke Test Script
Run end-to-end CRUD verification from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Test-TodoCrud.ps1
```

The script builds the project, starts `dotnet run --no-build`, performs POST → GET → PUT → GET → DELETE → GET(404), prints the results, and shuts the server down.
