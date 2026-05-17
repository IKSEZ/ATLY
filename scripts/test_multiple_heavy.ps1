$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicGVyZmlsIjoiYXRsZXRhIiwibm9tZSI6IlRlc3QgVXNlciIsImlhdCI6MTc3OTA1Mzk4NSwiZXhwIjoxNzc5MDgyNzg1fQ.P1esujldtTx7cUN_AGbqYfWKmhEr9ruDatIWe596aa8'

# Register multiple heavy treinos
Write-Host '=== Registering first heavy treino ==='
$t1 = @{ atleta_id = 8; intensidade=9; duracao_min=300; volume=10; tipo='corrida' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $t1 -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } > $null

Write-Host '=== Registering second heavy treino ==='
$t2 = @{ atleta_id = 8; intensidade=9; duracao_min=300; volume=10; tipo='musculação' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $t2 -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } > $null

Write-Host '=== Analysis result (may be ALTO now) ==='
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos/atleta/8/analise' -Method Get -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 5 | Write-Host
