# Simulating: light treino yesterday, heavy today to trigger "alto" risk
$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicGVyZmlsIjoiYXRsZXRhIiwibm9tZSI6IlRlc3QgVXNlciIsImlhdCI6MTc3OTA1Mzk4NSwiZXhwIjoxNzc5MDgyNzg1fQ.P1esujldtTx7cUN_AGbqYfWKmhEr9ruDatIWe596aa8'

# Register light treino 
Write-Host '=== Light treino ==='
$light = @{ atleta_id = 8; intensidade=3; duracao_min=30; volume=5; tipo='aquecimento' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $light -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } > $null
Write-Host 'Light treino registered'

# Now register a heavy one (should be same day but we'll show risk progression)
Write-Host '=== Heavy treino after light ==='
$heavy = @{ atleta_id = 8; intensidade=10; duracao_min=180; volume=15; tipo='corrida' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $heavy -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } > $null

Write-Host '=== Analysis: Heavy after light (60% increase scenario) ==='
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos/atleta/8/analise' -Method Get -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 5 | Write-Host
