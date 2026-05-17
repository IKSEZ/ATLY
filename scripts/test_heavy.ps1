$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicGVyZmlsIjoiYXRsZXRhIiwibm9tZSI6IlRlc3QgVXNlciIsImlhdCI6MTc3OTA1Mzk4NSwiZXhwIjoxNzc5MDgyNzg1fQ.P1esujldtTx7cUN_AGbqYfWKmhEr9ruDatIWe596aa8'

# Register heavy treino
$treino = @{ atleta_id = 8; intensidade=10; duracao_min=360; volume=10; tipo='corrida' } | ConvertTo-Json
Write-Host '=== Registering heavy treino ==='
$tr = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $treino -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" }
$tr | ConvertTo-Json -Depth 5 | Write-Host

# Analyze
Write-Host '=== Analysis result ==='
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos/atleta/8/analise' -Method Get -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 5 | Write-Host
