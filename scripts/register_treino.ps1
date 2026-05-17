$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicGVyZmlsIjoiYXRsZXRhIiwibm9tZSI6IlRlc3QgVXNlciIsImlhdCI6MTc3OTA1Mzk4NSwiZXhwIjoxNzc5MDgyNzg1fQ.P1esujldtTx7cUN_AGbqYfWKmhEr9ruDatIWe596aa8'
$treino = @{ atleta_id = 8; intensidade=5; duracao_min=30; volume=100; tipo='resistencia' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $treino -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 5 | Write-Host
