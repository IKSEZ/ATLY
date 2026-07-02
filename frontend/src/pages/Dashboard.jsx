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
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (atletaId) {
      buscarDados()
    } else {
      setCarregando(false)
    }
  }, [atletaId])

  async function buscarDados() {
    try {
      setCarregando(true)
      setErro('')
      const token = localStorage.getItem('token')

      const [resAnalise, resTreinos] = await Promise.all([
        api.get(`/treinos/atleta/${atletaId}/analise`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/treinos/atleta/${atletaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]).catch(err => {
        throw new Error("Falha na comunicação com o servidor de dados. " + err.message);
      })

      let dadosAnalise = null
      if (resAnalise && resAnalise.data) {
        dadosAnalise = resAnalise.data.analise || resAnalise.data
        setAnalise(dadosAnalise)
      } else {
        setAnalise(null)
      }

      if (dadosAnalise && dadosAnalise.treinos) {
        setTreinos(dadosAnalise.treinos.slice().reverse())
      } else if (resTreinos && resTreinos.data) {
        setTreinos(resTreinos.data.treinos || resTreinos.data || [])
      } else {
        setTreinos([])
      }

    } catch (error) {
      console.error('Erro crítico ao carregar dashboard do atleta:', error)
      setErro('Não foi possível sincronizar todos os dados de performance com a IA.')
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <section>
        <Header titulo="Carregando..." subtitulo="Sincronizando métricas com o sistema." />
        <div className="empty-state">Carregando painel de performance...</div>
      </section>
    )
  }

  if (!atletaId) {
    return (
      <section>
        <Header
          titulo="Dashboard do Atleta"
          subtitulo="Faça login com um atleta válido para visualizar os dados."
        />
        <div className="empty-state">
          Nenhum atleta identificado no sistema.
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

      {erro && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {erro} (Mostrando dados armazenados em cache)
        </div>
      )}

      <div className="cards">
        <StatCard 
          titulo="ACWR" 
          valor={analise?.acwr !== undefined && analise?.acwr !== null ? analise.acwr : '--'} 
          descricao="Índice atual" 
          destaque 
        />
        <StatCard 
          titulo="Nível de Risco" 
          valor={analise?.nivel_risco || 'baixo'} 
          descricao="Classificação atual" 
        />
        <StatCard 
          titulo="Carga Aguda" 
          valor={analise?.carga_aguda || analise?.carga_aguda_media || '0'} 
          descricao="Últimos 7 dias" 
        />
        <StatCard 
          titulo="Carga Crônica" 
          valor={analise?.carga_cronica || analise?.carga_cronica_media || '0'} 
          descricao="Últimos 28 dias" 
        />
      </div>

      <div className="dashboard-grid">
        <PerformanceChart treinos={treinos || []} />
        <HumanBodyRiskMap atletaId={atletaId} />
      </div>

      <div className="card full-card">
        <h3>Aviso da Análise</h3>
        <p>{analise?.mensagem || 'Nenhum alerta ou recomendação emitido pela IA para o período atual.'}</p>
      </div>

      <div className="card full-card">
        <h3>Histórico de Treinos</h3>
        <TrainingTable treinos={treinos || []} riscoGeral={analise?.nivel_risco || 'baixo'} />
      </div>
    </section>
  )
}

export default Dashboard