import Header from '../components/Header'
import HumanBodyRiskMap from '../components/HumanBodyRiskMap'
import StatCard from '../components/StatCard'

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

        <div className="card full-card">
          <h3>Histórico de Lesões</h3>
          <p>{atleta.historico_lesoes || 'Nenhum histórico informado.'}</p>
        </div>
      </div>
    </section>
  )
}

export default DetalhesAtleta