from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="ACWR IA Service", version="1.0.0")


class Treino(BaseModel):
    data_treino: str
    carga: float = Field(ge=0)


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
        }

    agora = datetime.now(timezone.utc)
    sete_dias = agora - timedelta(days=7)
    vinte_e_oito_dias = agora - timedelta(days=28)
    um_dia = agora - timedelta(days=1)

    cargas_7_dias: list[float] = []
    cargas_28_dias: list[float] = []
    carga_ontem: float | None = None
    carga_hoje: float | None = None

    # Sort treinos by data for analysis
    treinos_sorted = []
    for treino in payload.treinos:
        try:
            data = datetime.fromisoformat(treino.data_treino.replace("Z", "+00:00"))
        except ValueError:
            continue
        # Normalize naive datetimes to UTC for safe comparison
        if data.tzinfo is None:
            data = data.replace(tzinfo=timezone.utc)
        treinos_sorted.append((data, float(treino.carga)))

    treinos_sorted.sort()

    for data, carga in treinos_sorted:
        if data >= vinte_e_oito_dias:
            cargas_28_dias.append(carga)
        if data >= sete_dias:
            cargas_7_dias.append(carga)
        
        # Track yesterday and today's load
        if data >= um_dia:
            carga_ontem = carga
        if data.date() == agora.date():
            carga_hoje = carga

    carga_aguda = sum(cargas_7_dias) / max(len(cargas_7_dias), 1)
    carga_cronica = sum(cargas_28_dias) / max(len(cargas_28_dias), 1)
    acwr = round(carga_aguda / carga_cronica, 2) if carga_cronica > 0 else 0

    # Perfil defaults (parametrização por atleta em futuro)
    idade = int(payload.perfil.get("idade", 25) if isinstance(payload.perfil, dict) else getattr(payload.perfil, "idade", 25) or 25)
    limite_carga_diaria = 2000 + (200 if idade < 20 else -100 if idade > 40 else 0)

    # Determinar nível de risco com múltiplos fatores
    nivel = "baixo"
    mensagem = "Risco baixo de sobrecarga."

    # 1. ACWR tradicional (Acute:Chronic Workload Ratio)
    if acwr >= 1.5:
        nivel = "alto"
        mensagem = f"Risco alto: ACWR {acwr} (razão aguda/crônica elevada)."
    elif acwr >= 1.2:
        nivel = "moderado"
        mensagem = f"Risco moderado: ACWR {acwr}."

    # 2. Pico de carga no dia (sobrecarga aguda)
    if carga_hoje and carga_hoje > limite_carga_diaria:
        pct_excesso = round((carga_hoje - limite_carga_diaria) / limite_carga_diaria * 100)
        razao_limite = round(carga_hoje / limite_carga_diaria, 1)
        
        # Sobrecarga muito severa: > 1.5x do limite esperado
        if carga_hoje > 1.5 * limite_carga_diaria:
            nivel = "alto"
            mensagem = f"Risco alto: carga hoje ({carga_hoje:.0f}) é {razao_limite}x do limite esperado ({limite_carga_diaria:.0f})."
        elif nivel == "baixo":
            nivel = "moderado"
            mensagem = f"Risco moderado: carga hoje ({carga_hoje:.0f}) {pct_excesso}% acima do limite esperado."
        elif nivel == "moderado":
            nivel = "alto"
            mensagem = f"Risco alto: ACWR {acwr} E carga hoje ({carga_hoje:.0f}) {pct_excesso}% acima do limite."

    # 3. Aumento rápido (carga de hoje vs média aguda)
    if carga_hoje and carga_aguda > 0:
        pct_aumento = round((carga_hoje - carga_aguda) / carga_aguda * 100)
        if pct_aumento > 60:
            if nivel == "baixo":
                nivel = "moderado"
                mensagem = f"Risco moderado: aumento de {pct_aumento}% na carga vs média semanal."
            elif nivel == "moderado":
                nivel = "alto"
                mensagem = f"Risco alto: ACWR {acwr} e aumento brusco de {pct_aumento}% na carga."

    return {
        "acwr": acwr,
        "carga_aguda_media": round(carga_aguda, 1),
        "carga_cronica_media": round(carga_cronica, 1),
        "carga_hoje": carga_hoje,
        "nivel_risco": nivel,
        "mensagem": mensagem,
    }
