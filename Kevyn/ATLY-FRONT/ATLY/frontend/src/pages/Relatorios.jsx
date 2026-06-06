import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import TrainingTable from '../components/TrainingTable'

function Relatorios({ usuario, atletaSelecionado }) {
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)

  const atletaId =
    usuario?.perfil === 'tecnico' && atletaSelecionado?.id
      ? atletaSelecionado.id
      : usuario?.id

  async function carregarRelatorio() {
    if (!atletaId) return

    try {
      const response = await api.get(`/treinos/atleta/${atletaId}`)
      setTreinos(response.data || [])
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
            <TrainingTable treinos={treinos} />
          </div>
        </>
      )}
    </section>
  )
}

export default Relatorios