$body = @{ atleta_id=8; treinos=@(@{ data_treino = (Get-Date).ToString('o'); carga = 150 }); perfil = @{ idade=25; peso=70 } } | ConvertTo-Json -Depth 5
Write-Host '=== IA /analisar ==='
Invoke-RestMethod -Uri 'http://localhost:8000/analisar' -Method Post -Body $body -ContentType 'application/json' | ConvertTo-Json -Depth 5 | Write-Host
