import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import TrainingTable from '../components/TrainingTable'

function Relatorios({ usuario, atletaSelecionado }) {
  const [treinos, setTreinos] = useState([])
  const [analise, setAnalise] = useState(null)
  const [loading, setLoading] = useState(true)

  const idDoAtletaSelecionado = atletaSelecionado && typeof atletaSelecionado === 'object' 
    ? atletaSelecionado.id 
    : atletaSelecionado;

  const atletaId =
    usuario?.perfil === 'tecnico' && idDoAtletaSelecionado
      ? idDoAtletaSelecionado
      : usuario?.id

  async function carregarRelatorio() {
    if (usuario?.perfil === 'tecnico' && !idDoAtletaSelecionado) {
      setTreinos([])
      setAnalise(null)
      setLoading(false)
      return
    }

    if (!atletaId) return

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [resTreinos, resAnalise] = await Promise.all([
        api.get(`/treinos/atleta/${atletaId}`, { headers }),
        api.get(`/treinos/atleta/${atletaId}/analise`, { headers }).catch(() => ({ data: {} }))
      ])

      const dadosAnalise = resAnalise.data?.analise || resAnalise.data || null
      setAnalise(dadosAnalise)

      // CORREÇÃO VISUAL: Garante que o relatório use a lista da IA invertida para manter o mais novo no topo
      if (dadosAnalise && dadosAnalise.treinos) {
        setTreinos(dadosAnalise.treinos.slice().reverse())
      } else {
        setTreinos(resTreinos.data.treinos || resTreinos.data || [])
      }

    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRelatorio()
  }, [atletaId])

  const totalCarga = treinos.reduce(
    (total, treino) => total + Number(treino.carga || 0),
    0
  )

  const mediaCarga = treinos.length
    ? Math.round(totalCarga / treinos.length)
    : 0

  return (
    <section>
      <Header
        titulo="Relatórios"
        subtitulo="Resumo de treinos, volume e carga acumulada."
      />

      {loading ? (
        <div className="empty-state">Carregando relatório...</div>
      ) : usuario?.perfil === 'tecnico' && !idDoAtletaSelecionado ? (
        <div className="empty-state">Selecione um atleta para ver os relatórios.</div>
      ) : (
        <>
          <div className="cards-grid">
            <StatCard
              titulo="Total de Treinos"
              valor={treinos.length}
              descricao="Treinos registrados"
            />

            <StatCard
              titulo="Carga Total"
              valor={totalCarga}
              descricao="Soma das cargas"
              destaque
            />

            <StatCard
              titulo="Média de Carga"
              valor={mediaCarga}
              descricao="Média por treino"
            />

            <StatCard
              titulo="Última Carga"
              valor={treinos[0]?.carga || '--'}
              descricao="Último treino"
            />
          </div>

          <div className="card full-card">
            <h3>Dados do Relatório</h3>
            <TrainingTable treinos={treinos} riscoGeral={analise?.nivel_risco || 'baixo'} />
          </div>
        </>
      )}
    </section>
  )
}

export default Relatorios