$ts = (Get-Date -UFormat %s).Split(',')[0]
$cadBody = @{nome='Test User'; email="test+$ts@example.com"; senha='P@ssw0rd'; perfil='atleta'} | ConvertTo-Json
Write-Host '=== Health ==='
Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method Get | ConvertTo-Json -Depth 5 | Write-Host
Write-Host '=== Cadastro ==='
$cad = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/cadastro' -Method Post -Body $cadBody -ContentType 'application/json'
$cad | ConvertTo-Json -Depth 5 | Write-Host
$loginBody = @{ email=$cad.email; senha='P@ssw0rd' } | ConvertTo-Json
Write-Host '=== Login ==='
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
$login | ConvertTo-Json -Depth 5 | Write-Host
$token = $login.accessToken
Write-Host '=== Token ==='
Write-Host $token
Write-Host '=== Atletas ==='
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/atletas' -Method Get -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 5 | Write-Host
$treinoBody = @{ atleta_id = $cad.id; intensidade=5; duracao_min=30; volume=100; tipo='resistencia' } | ConvertTo-Json
Write-Host '=== Registrar Treino ==='
$tr = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $treinoBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" }
$tr | ConvertTo-Json -Depth 5 | Write-Host
