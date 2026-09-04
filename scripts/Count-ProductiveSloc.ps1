param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$SummaryOnly
)

$ErrorActionPreference = 'Stop'

$demoSeeders = @(
    'CompletarTodosLosPacientesSeeder.php',
    'DatosClinicosNutricionalesRealistasSeeder.php',
    'FlujoOperativoNutricionalRealistaSeeder.php',
    'OtrosPerfilesNutricionalesSeeder.php',
    'PacienteDiagnosticoClinicoSeeder.php',
    'PacientesPruebaSeeder.php',
    'PerfilesEndocrinologicosCompletosSeeder.php',
    'PerfilNutricionalPacienteSeeder.php',
    'UserSeeder.php',
    'UsuariosGoogleSeeder.php',
    'DatabaseSeeder.php'
)

$developmentCommands = @(
    'DebugAjustePlanCommand.php',
    'DebugNutricionSistemaExpertoCommand.php',
    'DebugPlanRecetasCommand.php',
    'ProbarEstructuraPlanAlimentarioCommand.php',
    'ProbarHechosSistemaExpertoCommand.php',
    'ProbarNutricionSistemaExpertoCommand.php',
    'ProbarPersistenciaSistemaExpertoCommand.php',
    'ProbarSistemaExpertoZenCommand.php',
    'ResumenPacientesPruebaCommand.php'
)

function Get-SourceFiles {
    param([string[]]$Roots, [string[]]$Extensions)

    foreach ($root in $Roots) {
        $absolute = Join-Path $ProjectRoot $root
        if (-not (Test-Path -LiteralPath $absolute)) { continue }

        Get-ChildItem -LiteralPath $absolute -Recurse -File | Where-Object {
            $name = $_.Name.ToLowerInvariant()
            $extensionMatches = $false
            foreach ($extension in $Extensions) {
                if ($name.EndsWith($extension)) {
                    $extensionMatches = $true
                    break
                }
            }

            $extensionMatches -and
            $_.FullName -notmatch '[\\/](tests?|vendor|node_modules|venv|storage|dist|build|__pycache__|\.git|\.pytest_cache)[\\/]' -and
            $_.Name -notin $demoSeeders -and
            $_.Name -notin $developmentCommands
        }
    }
}

function Test-CStyleCodeLine {
    param([string]$Line, [ref]$InsideBlockComment)

    $hasCode = $false
    $quote = [char]0
    $escaped = $false
    $index = 0

    while ($index -lt $Line.Length) {
        $current = $Line[$index]
        $next = if ($index + 1 -lt $Line.Length) { $Line[$index + 1] } else { [char]0 }

        if ($InsideBlockComment.Value) {
            if ($current -eq '*' -and $next -eq '/') {
                $InsideBlockComment.Value = $false
                $index += 2
                continue
            }
            $index++
            continue
        }

        if ($quote -ne [char]0) {
            if (-not [char]::IsWhiteSpace($current)) { $hasCode = $true }
            if ($escaped) {
                $escaped = $false
            } elseif ($current -eq '\') {
                $escaped = $true
            } elseif ($current -eq $quote) {
                $quote = [char]0
            }
            $index++
            continue
        }

        if ($current -eq '/' -and $next -eq '*') {
            $InsideBlockComment.Value = $true
            $index += 2
            continue
        }

        if ($current -eq '/' -and $next -eq '/') { break }

        if ($current -eq '#') { break }

        if ($current -eq '"' -or $current -eq "'" -or $current -eq '`') {
            $quote = $current
            $hasCode = $true
            $index++
            continue
        }

        if (-not [char]::IsWhiteSpace($current)) { $hasCode = $true }
        $index++
    }

    return $hasCode
}

function Measure-CStyleFile {
    param([System.IO.FileInfo]$File)

    $insideBlock = $false
    $count = 0
    foreach ($line in [System.IO.File]::ReadLines($File.FullName)) {
        if (Test-CStyleCodeLine -Line $line -InsideBlockComment ([ref]$insideBlock)) {
            $count++
        }
    }
    return $count
}

function Measure-PythonFile {
    param([System.IO.FileInfo]$File)

    $count = 0
    foreach ($line in [System.IO.File]::ReadLines($File.FullName)) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -gt 0 -and -not $trimmed.StartsWith('#')) {
            $count++
        }
    }
    return $count
}

$phpRoots = @('app', 'routes', 'resources/views', 'database/migrations', 'database/seeders', 'config/openai.php', 'config/services.php')
$frontendRoots = @('resources/js')
$pythonRoots = @('pmos-experto/app')

$phpFiles = @(Get-SourceFiles -Roots $phpRoots -Extensions @('.php'))
$frontendFiles = @(Get-SourceFiles -Roots $frontendRoots -Extensions @('.ts', '.tsx', '.js', '.jsx'))
$pythonFiles = @(Get-SourceFiles -Roots $pythonRoots -Extensions @('.py'))

$details = @()
foreach ($file in $phpFiles) {
    $details += [pscustomobject]@{ Language = 'PHP/Laravel'; File = $file.FullName.Substring($ProjectRoot.Length + 1); SLOC = Measure-CStyleFile $file }
}
foreach ($file in $frontendFiles) {
    $details += [pscustomobject]@{ Language = 'TypeScript/JavaScript/React'; File = $file.FullName.Substring($ProjectRoot.Length + 1); SLOC = Measure-CStyleFile $file }
}
foreach ($file in $pythonFiles) {
    $details += [pscustomobject]@{ Language = 'Python/FastAPI'; File = $file.FullName.Substring($ProjectRoot.Length + 1); SLOC = Measure-PythonFile $file }
}

$summary = @($details | Group-Object Language | ForEach-Object {
    [pscustomobject]@{
        Language = $_.Name
        Files = $_.Count
        SLOC = ($_.Group | Measure-Object SLOC -Sum).Sum
    }
})

$total = ($summary | Measure-Object SLOC -Sum).Sum

$result = [ordered]@{
    Method = 'Physical nonblank, non-comment source lines'
    Summary = $summary
    TotalSLOC = $total
    KSLOC = [math]::Round($total / 1000, 3)
    IncludedRoots = @($phpRoots + $frontendRoots + $pythonRoots)
    ExcludedDemoSeeders = $demoSeeders
    ExcludedDevelopmentCommands = $developmentCommands
}

if (-not $SummaryOnly) {
    $result.Details = @($details | Sort-Object Language, File)
}

[pscustomobject]$result | ConvertTo-Json -Depth 5
