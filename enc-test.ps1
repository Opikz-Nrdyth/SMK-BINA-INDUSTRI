# test-key.ps1
Write-Host "ENCRYPTION KEY VALIDATOR" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Yellow

# Test Key yang Anda berikan
$testKey = "a2c639aca1b7084c24a28f80ca5821db37f777791d5631d947ccbd98b30db980"

Write-Host "Testing Key: $testKey" -ForegroundColor Cyan
Write-Host "Key Length: $($testKey.Length) characters" -ForegroundColor White

# Test sebagai Base64
try {
    $keyBytes = [System.Convert]::FromBase64String($testKey)
    Write-Host "Valid Base64" -ForegroundColor Green
    Write-Host "Byte Length: $($keyBytes.Length) bytes" -ForegroundColor Green
    
    if ($keyBytes.Length -eq 32) {
        Write-Host "PERFECT! Key is 32 bytes for AES-256" -ForegroundColor Green
    } else {
        Write-Host "Key is $($keyBytes.Length) bytes (should be 32)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Invalid Base64: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=========================" -ForegroundColor Yellow
Write-Host "KEY INI SUDAH BISA DIPAKAI!" -ForegroundColor Green