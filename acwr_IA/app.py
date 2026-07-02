from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="ACWR IA Service", version="1.0.0")

class Treino(BaseModel):
    data_treino: str
    carga: float = Field(ge=0)
    tipo: str | None = None
    intensidade: int | None = None
    duracao_min: int | None = None
    volume: float | None = None

class Perfil(BaseModel):
    idade: int | None = None
    peso: float | None = None
    historico_lesoes: str | None = ""

class AnaliseRequest(BaseModel):
    atleta_id: str | int
    treinos: list[Treino] = Field(default_factory=list)
    perfil: Perfil | dict[str, Any] = Field(default_factory=dict)

@app.get("/")
def home():
    return {"status": "ok", "service": "ACWR IA Service"}

@app.post("/analisar")
def analisar(payload: AnaliseRequest):
    if not payload.treinos:
        return {
            "acwr": 0,
            "nivel_risco": "baixo",
            "mensagem": "Sem histórico suficiente para análise.",
            "treinos_analisados": []
        }

    agora = datetime.now(timezone.utc)
    sete_dias = agora - timedelta(days=7)
    vinte_e_oito_dias = agora - timedelta(days=28)
    um_dia = agora - timedelta(days=1)

    cargas_7_dias: list[float] = []
    cargas_28_dias: list[float] = []
    carga_hoje: float | None = None

    treinos_sorted = []
    for treino in payload.treinos:
        try:
            data = datetime.fromisoformat(treino.data_treino.replace("Z", "+00:00"))
        except ValueError:
            continue
        if data.tzinfo is None:
            data = data.replace(tzinfo=timezone.utc)
        treinos_sorted.append((data, treino))

    treinos_sorted.sort(key=lambda x: x[0])

    for data, treino in treinos_sorted:
        carga_val = float(treino.carga)
        if data >= vinte_e_oito_dias:
            cargas_28_dias.append(carga_val)
        if data >= sete_dias:
            cargas_7_dias.append(carga_val)
        if data.date() == agora.date():
            carga_hoje = carga_val

    carga_aguda = sum(cargas_7_dias) / max(len(cargas_7_dias), 1)
    carga_cronica = sum(cargas_28_dias) / max(len(cargas_28_dias), 1)
    acwr = round(carga_aguda / carga_cronica, 2) if carga_cronica > 0 else 0

    idade = int(payload.perfil.get("idade", 25) if isinstance(payload.perfil, dict) else getattr(payload.perfil, "idade", 25) or 25)
    limite_carga_diaria = 2000 + (200 if idade < 20 else -100 if idade > 40 else 0)

    treinos_analisados_resultado = []
    for data, treino in treinos_sorted:
        carga_val = float(treino.carga)

        if carga_val >= 1200 or (treino.intensidade and treino.intensidade >= 8):
            treino_risco = "alto"
        elif carga_val >= 600 or (treino.intensidade and treino.intensidade >= 6):
            treino_risco = "medio"
        else:
            treino_risco = "baixo"

        treinos_analisados_resultado.append({
            "id": getattr(treino, "id", None),
            "data_treino": treino.data_treino,
            "tipo": treino.tipo,
            "intensidade": treino.intensidade,
            "duracao_min": treino.duracao_min,
            "volume": treino.volume,
            "carga": treino.carga,
            "nivel_risco": treino_risco
        })

    nivel_macro = "baixo"
    mensagem = "Risco baixo de sobrecarga."

    if acwr >= 1.5:
        nivel_macro = "alto"
        mensagem = f"Risco alto: ACWR {acwr} (razão aguda/crônica elevada)."
    elif acwr >= 1.2:
        nivel_macro = "moderado"
        mensagem = f"Risco moderado: ACWR {acwr}."

    if carga_hoje and carga_hoje > limite_carga_diaria:
        pct_excesso = round((carga_hoje - limite_carga_diaria) / limite_carga_diaria * 100)
        razao_limite = round(carga_hoje / limite_carga_diaria, 1)

        if carga_hoje > 1.5 * limite_carga_diaria:
            nivel_macro = "alto"
            mensagem = f"Risco alto: carga hoje ({carga_hoje:.0f}) é {razao_limite}x do limite esperado ({limite_carga_diaria:.0f})."
        elif nivel_macro == "baixo":
            nivel_macro = "moderado"
            mensagem = f"Risco moderado: carga hoje ({carga_hoje:.0f}) {pct_excesso}% acima do limite esperado."
        elif nivel_macro == "moderado":
            nivel_macro = "alto"
            mensagem = f"Risco alto: ACWR {acwr} E carga hoje ({carga_hoje:.0f}) {pct_excesso}% acima do limite."

    return {
        "acwr": acwr,
        "carga_aguda_media": round(carga_aguda, 1),
        "carga_cronica_media": round(carga_cronica, 1),
        "carga_hoje": carga_hoje,
        "nivel_risco": nivel_macro,
        "mensagem": mensagem,
        "treinos": treinos_analisados_resultado
    }