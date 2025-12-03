param(
    [string]$BaseUrl = "http://localhost:5080/api/todos",
    [bool]$StartServer = $true,
    [int]$StartupTimeoutSeconds = 30,
    [string]$ProjectPath = (Join-Path $PSScriptRoot '..')
)

$ErrorActionPreference = "Stop"

function Invoke-TodoRequest {
    param(
        [Parameter(Mandatory)] [string]$Method,
        [Parameter(Mandatory)] [string]$Uri,
        [object]$Body
    )

    $params = @{
        Method = $Method
        Uri = $Uri
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

$serverJob = $null

try {
    if ($StartServer) {
        Write-Host "Ensuring project builds..." -ForegroundColor Cyan
        dotnet build | Out-Host

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

    Write-Host "Running Todo CRUD smoke test against $BaseUrl" -ForegroundColor Cyan

    # Create
    $newTodo = [ordered]@{
        title = "Scripted Todo $(Get-Date -Format s)"
        description = "Created by Test-TodoCrud.ps1"
        isCompleted = $false
    }
    $created = Invoke-TodoRequest -Method Post -Uri $BaseUrl -Body $newTodo
    $todoId = $created.id
    if (-not $todoId) {
        throw "Create response did not include an id."
    }
    Write-Host "Created todo $todoId" -ForegroundColor Green

    # First read
    $fetched = Invoke-TodoRequest -Method Get -Uri "$BaseUrl/$todoId"
    if ($fetched.id -ne $todoId) {
        throw "Fetched todo id mismatch."
    }
    Write-Host "Verified initial read" -ForegroundColor Green

    # Update
    $updatePayload = [ordered]@{
        id = $todoId
        title = "${($created.title)} - updated"
        description = "Updated at $(Get-Date -Format s)"
        isCompleted = $true
    }
    $updated = Invoke-TodoRequest -Method Put -Uri "$BaseUrl/$todoId" -Body $updatePayload
    if (-not $updated.IsCompleted) {
        throw "Update did not mark the todo as completed."
    }
    Write-Host "Updated todo" -ForegroundColor Green

    # Second read
    $fetchedAgain = Invoke-TodoRequest -Method Get -Uri "$BaseUrl/$todoId"
    if ($fetchedAgain.title -ne $updatePayload.title -or -not $fetchedAgain.isCompleted) {
        throw "Updated values were not persisted."
    }
    Write-Host "Verified updated read" -ForegroundColor Green

    # Delete
    Invoke-TodoRequest -Method Delete -Uri "$BaseUrl/$todoId"
    Write-Host "Deleted todo" -ForegroundColor Green

    # Final read expecting 404
    try {
        Invoke-TodoRequest -Method Get -Uri "$BaseUrl/$todoId"
        throw "Expected a 404 after deletion, but the item still exists."
    }
    catch [System.Net.WebException] {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode -ne 404) {
            throw
        }
        Write-Host "Confirmed deleted item no longer exists" -ForegroundColor Green
    }

    Write-Host "Todo CRUD smoke test passed" -ForegroundColor Cyan
}
finally {
    if ($serverJob) {
        Write-Host "Stopping dotnet run job" -ForegroundColor Cyan
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Write-Host "dotnet run output:" -ForegroundColor DarkGray
        Receive-Job -Job $serverJob | ForEach-Object { Write-Host $_ }
        Remove-Job -Job $serverJob | Out-Null
    }
}
