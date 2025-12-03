# Scripts

## Test-TodoCrud.ps1

Runs a Todo API smoke test end-to-end:

1. Build the project (unless `-StartServer:$false`).
2. Launch `dotnet run --no-build` in the background.
3. Wait for `GET /api/todos` to succeed.
4. POST ➜ GET ➜ PUT ➜ GET ➜ DELETE ➜ GET (expects 404).
5. Shut the Web API down and print its console output.

```powershell
# from the repo root
powershell -ExecutionPolicy Bypass -File .\server\scripts\Test-TodoCrud.ps1

# if you already have the API running, skip the auto-host
powershell -File .\server\scripts\Test-TodoCrud.ps1 -StartServer:$false

# point at a different base URL (e.g., HTTPS)
powershell -File .\server\scripts\Test-TodoCrud.ps1 -BaseUrl "https://localhost:7125/api/todos"
```

## Seed-IsureTodos.ps1

Seeds the FlaischerFlow database with 31 humorous, isure-themed todos chronicling Michael's entire journey from receiving the home assignment to getting hired:

- **Phase 1**: Reading & planning the assignment
- **Phase 2**: Backend & Azure Cosmos setup
- **Phase 3**: Angular client & basic UI
- **Phase 4**: FlaischerFlow UX refactor & branding
- **Phase 5**: README, QA, submission
- **Phase 6**: Interview process, offer, contract, first day

Perfect for demo purposes and showcasing the full FlaischerFlow experience.

```powershell
# Seed with API already running (recommended)
powershell -ExecutionPolicy Bypass -File .\server\scripts\Seed-IsureTodos.ps1

# Auto-start the server and seed
powershell -File .\server\scripts\Seed-IsureTodos.ps1 -StartServer:$true

# Point at a different API endpoint
powershell -File .\server\scripts\Seed-IsureTodos.ps1 -BaseUrl "https://localhost:7125/api/todos"
```

**Output**: Color-coded console messages showing each todo being created, with a final summary of success/failure counts.

**Note**: Run this script to populate a fresh database or add the isure journey workflow to an existing database.
