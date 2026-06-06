$ts = (Get-Date -UFormat %s).Split(',')[0]

function New-Usuario([string]$Nome, [string]$Perfil) {
	$cadBody = @{ nome = $Nome; email = "test+$Perfil+$ts@example.com"; senha = 'P@ssw0rd'; perfil = $Perfil } | ConvertTo-Json
	$cad = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/cadastro' -Method Post -Body $cadBody -ContentType 'application/json'
	$loginBody = @{ email = $cad.usuario.email; senha = 'P@ssw0rd' } | ConvertTo-Json
	$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'

	return [pscustomobject]@{
		cadastro = $cad.usuario
		login = $login
	}
}

Write-Host '=== Health ==='
Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method Get | ConvertTo-Json -Depth 5 | Write-Host

Write-Host '=== Cadastro Tecnico ==='
$tecnico = New-Usuario -Nome 'Test Tech' -Perfil 'tecnico'
$tecnico.cadastro | ConvertTo-Json -Depth 5 | Write-Host

Write-Host '=== Atletas (tecnico) ==='
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/atletas' -Method Get -Headers @{ Authorization = "Bearer $($tecnico.login.accessToken)" } | ConvertTo-Json -Depth 5 | Write-Host

Write-Host '=== Cadastro Atleta ==='
$atleta = New-Usuario -Nome 'Test Athlete' -Perfil 'atleta'
$atleta.cadastro | ConvertTo-Json -Depth 5 | Write-Host

Write-Host '=== Registrar Treino ==='
$treinoBody = @{ atleta_id = $atleta.cadastro.id; intensidade = 5; duracao_min = 30; volume = 100; tipo = 'resistencia' } | ConvertTo-Json
$tr = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/treinos' -Method Post -Body $treinoBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $($atleta.login.accessToken)" }
$tr | ConvertTo-Json -Depth 5 | Write-Host

Write-Host '=== Analise ACWR ==='
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/treinos/atleta/$($atleta.cadastro.id)/analise" -Method Get -Headers @{ Authorization = "Bearer $($atleta.login.accessToken)" } | ConvertTo-Json -Depth 5 | Write-Host
