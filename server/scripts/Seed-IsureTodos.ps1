param(
    [string]$BaseUrl = "http://localhost:5080/api/todos",
    [bool]$StartServer = $false,
    [int]$StartupTimeoutSeconds = 30,
    [string]$ProjectPath = "$PSScriptRoot/.."
)

$ErrorActionPreference = "Stop"

function Invoke-TodoRequest {
    param(
        [Parameter(Mandatory)] [string]$Method,
        [Parameter(Mandatory)] [string]$Uri,
        [object]$Body
    )

    $params = @{
        Method      = $Method
        Uri         = $Uri
        ContentType = "application/json"
        ErrorAction = "Stop"
    }

    if ($PSBoundParameters.ContainsKey('Body')) {
        $params.Body = ($Body | ConvertTo-Json -Depth 5)
    }

    return Invoke-RestMethod @params
}

function Wait-ForApi {
    param(
        [string]$HealthUrl,
        [int]$TimeoutSeconds,
        [System.Management.Automation.Job]$ServerJob
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if ($ServerJob -and $ServerJob.State -eq 'Failed') {
            $details = Receive-Job -Job $ServerJob -Keep | Out-String
            throw "dotnet run failed to start:`n$details"
        }

        try {
            Invoke-RestMethod -Method Get -Uri $HealthUrl | Out-Null
            return
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }

    throw "API did not become reachable within $TimeoutSeconds seconds."
}

# Define seed todos: isure home assignment journey from start to hired
$seedTodos = @(
    # --- Phase 1: Reading and planning the isure assignment ---
    [ordered]@{
        title       = "Read the isure full-stack assignment PDF"
        description = "Open the brief, read every line, and whisper: 'Challenge accepted.'"
        isCompleted = $false
    }
    [ordered]@{
        title       = "Break the assignment into tiny battle steps"
        description = "Backend, frontend, Azure, README - no panic, just a checklist."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Create the FlaischerFlow repo"
        description = "Because if I'm already suffering, at least it will be branded."
        isCompleted = $false
    }

    # --- Phase 2: Backend & Azure setup ---
    [ordered]@{
        title       = "Install .NET SDK without crying"
        description = "Download, install, run 'dotnet --version' and hope for no red errors."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Spin up a new .NET Web API project for isure"
        description = "Minimal controllers, maximum potential."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Create Azure Cosmos DB for todos"
        description = "Account, database, container - and no secrets in git, promise."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Hook the API to Cosmos like a pro"
        description = "TodoService + CosmosClient + clean CRUD."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Pass the Todo CRUD smoke test"
        description = "POST -> GET -> PUT -> GET -> DELETE -> GET(404). Green output or bust."
        isCompleted = $false
    }

    # --- Phase 3: Angular client + basic UI ---
    [ordered]@{
        title       = "Generate Angular client project"
        description = "ng new client, SCSS, routing - no AI analytics, just human panic."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Wire Angular HttpClient to isure API"
        description = "Point the front to http://localhost:5080/api/todos and pray for CORS peace."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Render todos in a proper list"
        description = "No console.log debugging in production UI. Well... almost."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Implement add / edit / delete from the UI"
        description = "So the interviewer can click around and say 'Nice...' very professionally."
        isCompleted = $false
    }

    # --- Phase 4: FlaischerFlow UX & refactor ---
    [ordered]@{
        title       = "Refactor into TodoPage, TodoList, TodoItem components"
        description = "Because dumping all logic into app.ts is illegal in 37 countries."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Add hilarious isure-themed copy to the UI"
        description = "FlaischerFlow - tracking my journey from assignment to offer letter."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Add filter buttons: All / Active / Completed"
        description = "Because even my anxiety needs filtering options."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Add modal dialog for adding and editing todos"
        description = "No more inline chaos - proper centered dialog with Save/Cancel."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Add delete confirmation modal"
        description = "Accidentally deleting 'Sign contract with isure' would be tragic."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Polish the SCSS so everything looks intentional"
        description = "Gray background, centered card, nice buttons - and zero Bootstrap guilt."
        isCompleted = $false
    }

    # --- Phase 5: README, sanity & submission ---
    [ordered]@{
        title       = "Write a clear README for isure"
        description = "Setup, run client/server, environment variables - everything future me will forget."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Run full manual QA pass"
        description = "Open app, break things on purpose, fix them before isure finds them."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Push clean commits to Git"
        description = "No 'fix fix final_final_v2' messages. Only grown-up commit history."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Send the repository link to isure"
        description = "Deep breath. Click send. Try not to re-read the email 17 times."
        isCompleted = $false
    }

    # --- Phase 6: Interview & hiring flow in FlaischerFlow style ---
    [ordered]@{
        title       = "Get the 'We'd love to talk' email from isure"
        description = "Refresh inbox every 3 minutes until it appears. Totally healthy behavior."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Schedule the technical interview with isure"
        description = "Pick a date where brain and caffeine are both available."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Survive the technical interview"
        description = "Explain the architecture. Pretend you always knew .NET + Angular + Azure."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Answer 'Where do you see yourself in 2 years?' without saying 'in your chair'"
        description = "Professional yet honest - classic job-interview boss fight."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Receive the isure job offer"
        description = "Read it twice. Screenshot it. Send to family WhatsApp. Cry a little (happy)."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Sign the contract with isure"
        description = "Digital or pen - either way, this is the best line you'll ever draw."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Celebrate getting hired"
        description = "Pizza, ice cream, or quiet Netflix. Your choice, you earned it."
        isCompleted = $false
    }
    [ordered]@{
        title       = "First day at isure"
        description = "New laptop, new Slack channels, new 'who broke production?' mysteries."
        isCompleted = $false
    }
    [ordered]@{
        title       = "Use FlaischerFlow at isure to manage real tasks"
        description = "The assignment app comes full circle and becomes a real-life productivity tool."
        isCompleted = $false
    }
)

$serverJob = $null

try {
    if ($StartServer) {
        Write-Host "Ensuring project builds..." -ForegroundColor Cyan
        Push-Location $ProjectPath
        dotnet build | Out-Host
        Pop-Location

        Write-Host "Starting Web API via dotnet run --no-build" -ForegroundColor Cyan
        $serverJob = Start-Job -ScriptBlock {
            param($path)
            Set-Location $path
            dotnet run --no-build
        } -ArgumentList $ProjectPath

        Write-Host "Waiting for API to become available..." -ForegroundColor Cyan
        Wait-ForApi -HealthUrl $BaseUrl -TimeoutSeconds $StartupTimeoutSeconds -ServerJob $serverJob
    }
    else {
        Write-Host "Assuming API already running at $BaseUrl" -ForegroundColor Yellow
    }

    Write-Host "`nSeeding isure-themed todos into FlaischerFlow..." -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor DarkGray

    $successCount = 0
    $failCount = 0

    foreach ($todo in $seedTodos) {
        try {
            $created = Invoke-TodoRequest -Method Post -Uri $BaseUrl -Body $todo
            Write-Host "[OK] Seeded: " -NoNewline -ForegroundColor Green
            Write-Host $todo.title -ForegroundColor White
            $successCount++
        }
        catch {
            Write-Host "[FAIL] Failed: " -NoNewline -ForegroundColor Red
            Write-Host $todo.title -ForegroundColor White
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor DarkRed
            $failCount++
        }
    }

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "`nSeeding complete!" -ForegroundColor Cyan
    Write-Host "  Total: $($seedTodos.Count) todos" -ForegroundColor White
    Write-Host "  Success: $successCount" -ForegroundColor Green
    if ($failCount -gt 0) {
        Write-Host "  Failed: $failCount" -ForegroundColor Red
    }
    Write-Host "`nYour isure journey from assignment to hire is now tracked in FlaischerFlow!" -ForegroundColor Cyan
}
finally {
    if ($serverJob) {
        Write-Host "`nStopping dotnet run job..." -ForegroundColor Cyan
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Write-Host "dotnet run output:" -ForegroundColor DarkGray
        Receive-Job -Job $serverJob | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }
        Remove-Job -Job $serverJob | Out-Null
    }
}
