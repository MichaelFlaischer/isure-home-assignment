# Scripts

## Test-TodoCrud.ps1

Runs a Todo API smoke test end-to-end:

1. Build the project (unless `-StartServer:$false`).
2. Launch `dotnet run --no-build` in the background.
3. Wait for `GET /api/todos` to succeed.
4. POST ➜ GET ➜ PUT ➜ GET ➜ DELETE ➜ GET (expects 404).
5. Shut the Web API down and print its console output.

```powershell
# from the project root, no manual steps needed
powershell -ExecutionPolicy Bypass -File .\scripts\Test-TodoCrud.ps1

# if you already have the API running, skip the auto-host
powershell -File .\scripts\Test-TodoCrud.ps1 -StartServer:$false

# point at a different base URL (e.g., HTTPS)
powershell -File .\scripts\Test-TodoCrud.ps1 -BaseUrl "https://localhost:7125/api/todos"
```
