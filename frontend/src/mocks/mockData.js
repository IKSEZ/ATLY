export const mockDashboard = {
  acwr: 1.12,
  cargaAguda: 820,
  cargaCronica: 730,
  risco: "MODERADO",
  treinosSemana: 5
}

export const mockTreinos = [
  {
    id: 1,
    data: "2026-06-01",
    tipo: "Corrida",
    intensidade: 7,
    duracao: 60,
    carga: 420
  },
  {
    id: 2,
    data: "2026-06-03",
    tipo: "Musculação",
    intensidade: 8,
    duracao: 50,
    carga: 400
  }
]

export const mockAlertas = [
  {
    id: 1,
    area: "Joelho Direito",
    descricao: "Sobrecarga detectada",
    nivel: "ALTO"
  },
  {
    id: 2,
    area: "Posterior Coxa",
    descricao: "Fadiga acumulada",
    nivel: "MÉDIO"
  }
]

export const mockMapaCorporal = {
  alertas: mockAlertas,
  regioes: [
    {
      id: 1,
      nome: "Joelho Direito",
      descricao: "Sobrecarga",
      nivel: "ALTO",
      x: 55,
      y: 70
    },
    {
      id: 2,
      nome: "Posterior Coxa",
      descricao: "Fadiga",
      nivel: "MÉDIO",
      x: 50,
      y: 58
    }
  ]
}

export const mockAtletas = [
  {
    id: 1,
    nome: "Carlos Silva",
    idade: 24,
    modalidade: "Futebol",
    risco: "ALTO"
  },
  {
    id: 2,
    nome: "João Pedro",
    idade: 21,
    modalidade: "Corrida",
    risco: "BAIXO"
  }
]