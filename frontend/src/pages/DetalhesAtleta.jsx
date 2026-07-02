import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import HumanBodyRiskMap from '../components/HumanBodyRiskMap'
import StatCard from '../components/StatCard'

function DetalhesAtleta({ atletaID, atletaId, atletaSelecionado }) {
  const idReal = atletaID || atletaId || atletaSelecionado

  const [atleta, setAtleta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!idReal) return

    async function buscarAtleta() {
      setLoading(true)
      setErro('')
      setAtleta(null)

      try {
        const response = await api.get(`/atletas/${idReal}`)
        
        setAtleta(response.data.atleta || response.data)
      } catch (err) {
        console.error('Erro ao buscar detalhes do atleta:', err)
        setErro('Não foi possível carregar os dados do atleta.')
      } finally {
        setLoading(false)
      }
    }

    buscarAtleta()
  }, [idReal])

  if (!idReal) {
    return (
      <section>
        <Header
          titulo="Detalhes do Atleta"
          subtitulo="Selecione um atleta no painel técnico."
        />
        <div className="empty-state">Nenhum atleta selecionado.</div>
      </section>
    )
  }

  if (loading) {
    return (
      <section>
        <Header titulo="Carregando..." subtitulo="Buscando dados do atleta." />
        <div className="empty-state">Carregando...</div>
      </section>
    )
  }

  if (erro) {
    return (
      <section>
        <Header titulo="Erro" subtitulo="Não foi possível carregar o atleta." />
        <div className="error-message">{erro}</div>
      </section>
    )
  }

  if (!atleta) return null

  return (
    <section>
      <Header
        titulo={atleta.nome || 'Visualização do Atleta'}
        subtitulo={atleta.modalidade || 'Atleta vinculado ao técnico'}
      />

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard 
          titulo="ACWR"
          valor={atleta.acwr ?? '--'} 
          descricao="Índice atual" 
        />
        <StatCard
          titulo="Risco"
          valor={atleta.nivel_risco ?? '—'}
          descricao="Classificação atual"
        />
        <StatCard
          titulo="Peso"
          valor={atleta.peso ? `${atleta.peso} kg` : '—'}
          descricao="Dados físicos"
        />
        <StatCard
          titulo="Idade"
          valor={atleta.idade ? `${atleta.idade} anos` : '—'}
          descricao="Dados físicos"
        />
      </div>

      <div className="dashboard-grid">
        <HumanBodyRiskMap atletaId={idReal} />

        <div className="card full-card" style={{ marginTop: '20px' }}>
          <h3>Histórico de Lesões</h3>
          <p>{atleta.historico_lesoes || 'Nenhum histórico informado.'}</p>
        </div>

        {atleta.mensagem && (
          <div className="card full-card" style={{ marginTop: '20px' }}>
            <h3>Análise IA</h3>
            <p>{atleta.mensagem}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default DetalhesAtleta
