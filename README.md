# isure Home Assignment – Full-Stack Todo App

## Overview

This repository contains a full-stack Todo application that showcases an Angular frontend backed by a .NET 8 Web API and Azure Cosmos DB for persistence.

- **Frontend:** Angular 17 standalone app (SCSS, signals, standalone components)
- **Backend:** .NET 8 Web API with Cosmos SDK
- **Database:** Azure Cosmos DB for NoSQL (todosdb / todos container)
- **API surface:** REST endpoints under `http://localhost:5080/api/todos`

## Project Structure

- `server/` – ASP.NET Core Web API, Cosmos integration, CRUD endpoints
- `client/` – Angular 17 SPA that consumes the API and manages Todos

## Prerequisites

- Node.js 18+ (LTS) and npm
- .NET 8 SDK
- An Azure Cosmos DB account (NoSQL API) or the Azure Cosmos DB emulator

## Backend Setup (`/server`)

1. Navigate to the server project:
   ```bash
   cd server
   ```
2. Configure Cosmos settings. `appsettings.json` contains a placeholder section:
   ```json
   "Cosmos": {
     "Endpoint": "COSMOS_ENDPOINT_PLACEHOLDER",
     "Key": "COSMOS_KEY_PLACEHOLDER"
   }
   ```
   Supply real values via [user secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets), environment variables, or a local override file that is gitignored.
3. Restore and run:
   ```bash
   dotnet restore
   dotnet run --urls http://localhost:5080
   ```
   The API now listens on `http://localhost:5080` and exposes CRUD endpoints at `/api/todos`.
4. Optional – run the automated CRUD smoke test:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\Test-TodoCrud.ps1
   ```
   The script builds the project, runs `dotnet run --no-build`, executes POST→GET→PUT→GET→DELETE→GET(404), and shuts the server down.

## Frontend Setup (`/client`)

1. Navigate to the Angular project:
   ```bash
   cd client
   ```
2. Install dependencies (first run only):
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   ng serve --port 4200
   ```
4. Browse to `http://localhost:4200`. The client expects the backend at `http://localhost:5080/api/todos`. Adjust the base URL in `src/app/services/todo.service.ts` if your backend differs.

## Running Both Apps Together

- Backend: `cd server && dotnet run --urls http://localhost:5080`
- Frontend: `cd client && ng serve --port 4200`

Stop each process with `Ctrl+C` when finished.

## Notes

- No secrets are committed to source control. Use configuration providers for Cosmos credentials.
- The Angular UI is responsive, uses standalone components (TodoPage → TodoList → TodoItem, plus TodoFormModal and ConfirmDialog), and consumes the backend via `TodoService`.
- Todos now include a `createdAt` timestamp that is stored in Cosmos DB and displayed in the UI.
