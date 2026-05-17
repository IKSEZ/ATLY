import api from './api'

const treinoService = {
  // Registrar novo treino
  async registrar(atletaId, intensidade, duracao_min, volume, tipo) {
    const response = await api.post('/treinos', {
      atleta_id: atletaId,
      intensidade,
      duracao_min,
      volume,
      tipo,
    })
    return response.data
  },

  // Listar treinos do atleta
  async listarPorAtleta(atletaId) {
    const response = await api.get(`/treinos/atleta/${atletaId}`)
    return response.data
  },

  // Analisar carga (chamar IA)
  async analisarCarga(atletaId) {
    const response = await api.get(`/treinos/atleta/${atletaId}/analise`)
    return response.data
  },
}

export default treinoService
