import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import RiskBadge from '../components/RiskBadge'

function DashboardTecnico({ tecnicoId, setTela, setAtletaSelecionado }) {
  const [atletas, setAtletas] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregarAtletas() {
    try {
      const response = await api.get('/atletas')
      setAtletas(response.data.atletas || [])
    } catch (error) {
      console.error('Erro ao buscar atletas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAtletas()
  }, [tecnicoId])

<<<<<<< HEAD
function abrirAtleta(atleta) {
    // Passa só o ID — DetalhesAtleta busca os dados completos da API por conta própria
    setAtletaSelecionado(atleta.id)
    setTela('detalhes-atleta')
=======
  async function abrirAtleta(atleta) {
    try {
      const response = await api.get(`/atletas/${atleta.id}`)
      setAtletaSelecionado(response.data.atleta || atleta)
      setTela('detalhes-atleta')
    } catch (error) {
      console.error('Erro ao carregar detalhe do atleta:', error)
      setAtletaSelecionado(atleta)
      setTela('detalhes-atleta')
    }
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
  }

  return (
    <section>
      <Header
        titulo="Painel Técnico"
        subtitulo="Acompanhe os atletas vinculados e seus níveis de risco."
      />

      <div className="card full-card">
        <h3>Atletas Monitorados</h3>

        {loading ? (
          <div className="empty-state">Carregando atletas...</div>
        ) : !atletas.length ? (
          <div className="empty-state">Nenhum atleta vinculado.</div>
        ) : (
          <div className="athletes-grid">
            {atletas.map((atleta) => (
              <button
                key={atleta.id}
                className="athlete-card"
                onClick={() => abrirAtleta(atleta)}
              >
                <div>
                  <h3>{atleta.nome}</h3>
                  <p>{atleta.email}</p>
                </div>

                <RiskBadge risco={atleta.nivel_risco} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DashboardTecnico