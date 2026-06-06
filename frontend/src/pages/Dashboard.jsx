import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import TrainingTable from '../components/TrainingTable'
import PerformanceChart from '../components/PerformanceChart'
import HumanBodyRiskMap from '../components/HumanBodyRiskMap'

function Dashboard({ atletaId }) {
  const [analise, setAnalise] = useState(null)
  const [treinos, setTreinos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (atletaId) {
      buscarDados()
    } else {
      setCarregando(false)
    }
  }, [atletaId])

  async function buscarDados() {
    try {
      const token = localStorage.getItem('token')

      const [resAnalise, resTreinos] = await Promise.all([
        api.get(`/treinos/atleta/${atletaId}/analise`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/treinos/atleta/${atletaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setAnalise(resAnalise.data.analise)
      setTreinos(resTreinos.data.treinos || [])
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return <div className="empty-state">Carregando dashboard...</div>
  }

  if (!atletaId) {
    return (
      <section>
        <Header
          titulo="Dashboard do Atleta"
          subtitulo="Faça login com um atleta válido para visualizar os dados."
        />
        <div className="empty-state">
          Nenhum atleta identificado.
        </div>
      </section>
    )
  }

  return (
    <section>
      <Header
        titulo="Dashboard do Atleta"
        subtitulo="Monitoramento de carga física, ACWR e risco de lesão."
      />

      <div className="cards">
        <StatCard titulo="ACWR" valor={analise?.acwr} descricao="Índice atual" destaque />
        <StatCard titulo="Nível de Risco" valor={analise?.nivel_risco} descricao="Classificação atual" />
        <StatCard titulo="Carga Aguda" valor={analise?.carga_aguda || analise?.carga_aguda_media} descricao="Últimos 7 dias" />
        <StatCard titulo="Carga Crônica" valor={analise?.carga_cronica || analise?.carga_cronica_media} descricao="Últimos 28 dias" />
      </div>

      <div className="dashboard-grid">
        <PerformanceChart treinos={treinos} />
        <HumanBodyRiskMap risco={analise?.nivel_risco} />
      </div>

      <div className="card full-card">
        <h3>Aviso da Análise</h3>
        <p>{analise?.mensagem || 'Nenhuma análise encontrada.'}</p>
      </div>

      <div className="card full-card">
        <h3>Histórico de Treinos</h3>
        <TrainingTable treinos={treinos} />
      </div>
    </section>
  )
}

export default Dashboard