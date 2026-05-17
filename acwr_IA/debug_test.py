import requests
import json
from datetime import datetime

payload = {
    "atleta_id": 8,
    "treinos": [
        {"data_treino": datetime.utcnow().isoformat() + "Z", "carga": 3600}
    ],
    "perfil": {"idade": 25, "peso": 70}
}

resp = requests.post("http://localhost:8000/analisar", json=payload)
print(json.dumps(resp.json(), indent=2))
