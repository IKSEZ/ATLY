import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import RiskBadge from '../components/RiskBadge'

function Alertas({ usuario, atletaSelecionado }) {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregarAlertas() {
    if (usuario?.perfil === 'tecnico' && !atletaSelecionado?.id) {
      setAlertas([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let url = `/relatorios/atleta/${usuario.id}/alertas`

      if (usuario?.perfil === 'atleta') {
        url = `/relatorios/atleta/${usuario.id}/alertas`
      }

      if (usuario?.perfil === 'tecnico' && atletaSelecionado?.id) {
        url = `/relatorios/atleta/${atletaSelecionado.id}/alertas`
      }

      const response = await api.get(url)
      setAlertas(response.data.alertas || [])
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAlertas()
  }, [usuario, atletaSelecionado])

  return (
    <section>
      <Header
        titulo="Alertas"
        subtitulo="Acompanhe alertas de risco, sobrecarga e variações de carga."
      />

      <div className="card full-card">
        {loading ? (
          <div className="empty-state">Carregando alertas...</div>
        ) : usuario?.perfil === 'tecnico' && !atletaSelecionado?.id ? (
          <div className="empty-state">Selecione um atleta para ver os alertas.</div>
        ) : !alertas.length ? (
          <div className="empty-state">Nenhum alerta encontrado.</div>
        ) : (
          <div className="alerts-list">
            {alertas.map((alerta) => (
              <div className="alert-item" key={alerta.id}>
                <div>
                  <h3>{alerta.titulo || 'Alerta de Performance'}</h3>
                  <p>{alerta.mensagem}</p>
                  <span>
                    {alerta.data_criacao
                      ? new Date(alerta.data_criacao).toLocaleString('pt-BR')
                      : ''}
                  </span>
                </div>

                <RiskBadge
                  risco={
                    alerta.nivel_risco ||
                    (alerta.tipo === 'sobrecarga' ? 'alto' : alerta.tipo) ||
                    'sem dados'
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Alertas