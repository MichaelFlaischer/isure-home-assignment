# Scripts

Automation utilities that live under `server/scripts`.

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

# reuse an already running API
powershell -File .\server\scripts\Test-TodoCrud.ps1 -StartServer:$false

# test against production (careful: mutates real data)
powershell -File .\server\scripts\Test-TodoCrud.ps1 -BaseUrl "https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos" -StartServer:$false
```

## Seed-IsureTodos.ps1

Seeds the FlaischerFlow database with 31 humorous, isure-themed todos chronicling the assignment journey:

- **Phase 1**: Reading & planning the brief
- **Phase 2**: Backend & Azure Cosmos setup
- **Phase 3**: Angular client foundation
- **Phase 4**: FlaischerFlow UX polish & branding
- **Phase 5**: Documentation, QA, submission
- **Phase 6**: Interview process and onboarding

```powershell
# Seed with API already running (recommended)
powershell -ExecutionPolicy Bypass -File .\server\scripts\Seed-IsureTodos.ps1

# Auto-start the server and seed
powershell -File .\server\scripts\Seed-IsureTodos.ps1 -StartServer:$true

# Point at production (only when demo data is acceptable)
powershell -File .\server\scripts\Seed-IsureTodos.ps1 -BaseUrl "https://flaischerflow-api-dufufag9eabkgffn.israelcentral-01.azurewebsites.net/api/todos" -StartServer:$false
```

**Output**: Color-coded console messages for every created todo plus a summary of success/failure counts.

**Reminder**: Both scripts mutate data; aim them at production only when those changes are desired.
