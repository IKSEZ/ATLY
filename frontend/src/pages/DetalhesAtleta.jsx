<<<<<<< HEAD
import { useEffect, useState } from 'react'
import api from '../services/api'
=======
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
import Header from '../components/Header'
import HumanBodyRiskMap from '../components/HumanBodyRiskMap'
import StatCard from '../components/StatCard'

<<<<<<< HEAD
// atletaId: ID do atleta selecionado (número)
// Substituiu a prop "atleta" direta - agora busca da API
function DetalhesAtleta({ atletaID }) {
  const [atleta, setAtleta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!atletaID) return

    async function buscarAtleta() {
      setLoading(true)
      setErro('')
      setAtleta(null)

      try {
        const response = await api.get(`/atletas/${atletaID}`)
        setAtleta(response.data.atleta)
      } catch (err) {
        setErro('Não foi possível carregar os dados do atleta.')
      } finally {
        setLoading(false)
      }
    }

    buscarAtleta()
  }, [atletaID])

    if (atletaID) {
      return (
        <section>
          <Header
            titulo="Detalhes do Atleta"
            subtitulo="Selecione um atleta no painel técnico."
          />
          <div className="empty-state">Nenhum altleta selecionado.</div>
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
            titulo={atleta.nome}
              subtitulo={atleta.modalidade || 'Atleta vinculado ao técnico'}
              />

        <div className="cards">
          <statCard 
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
        {/* Passa o ID para o mapa buscar do endpoint real */}
        <HumanBodyRiskMap atletaId={atletaId} />
 
=======
function DetalhesAtleta({ atleta }) {
  if (!atleta) {
    return (
      <section>
        <Header
          titulo="Detalhes do Atleta"
          subtitulo="Selecione um atleta no painel técnico."
        />

        <div className="empty-state">
          Nenhum atleta selecionado.
        </div>
      </section>
    )
  }

  return (
    <section>
      <Header
        titulo={atleta.nome}
        subtitulo={atleta.modalidade || 'Atleta vinculado ao técnico'}
      />

      <div className="cards">
        <StatCard titulo="ACWR" valor={atleta.acwr} descricao="Índice atual" />
        <StatCard titulo="Risco" valor={atleta.nivel_risco} descricao="Classificação atual" />
        <StatCard titulo="Peso" valor={atleta.peso} descricao="Dados físicos" />
        <StatCard titulo="Idade" valor={atleta.idade} descricao="Dados físicos" />
      </div>

      <div className="dashboard-grid">
        <HumanBodyRiskMap risco={atleta.nivel_risco} />

>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
        <div className="card full-card">
          <h3>Histórico de Lesões</h3>
          <p>{atleta.historico_lesoes || 'Nenhum histórico informado.'}</p>
        </div>
<<<<<<< HEAD

        {atleta.mensagem && (
          <div className="card full-card">
            <h3>Análise IA</h3>
            <p>{atleta.mensagem}</p>
          </div>
        )}
=======
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
      </div>
    </section>
  )
}

export default DetalhesAtleta