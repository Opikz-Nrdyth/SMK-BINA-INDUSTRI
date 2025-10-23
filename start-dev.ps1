function Start-DevServer {
    param (
        [string]$Path = "."
    )

    Set-Location $Path

    while ($true) {
        Write-Host "Menjalankan 'npm run dev'..." -ForegroundColor Green
        npm run dev
        Write-Host "'npm run dev' berhenti, akan mencoba restart dalam 3 detik..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

# <-- Tambahkan ini supaya langsung jalan saat file dijalankan
Start-DevServer -Path "F:\Bank Project\2026\SMK-BINA-INDUSTRI"
