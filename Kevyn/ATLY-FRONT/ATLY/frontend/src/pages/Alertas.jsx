import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import RiskBadge from '../components/RiskBadge'

function Alertas({ usuario, atletaSelecionado }) {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregarAlertas() {
    try {
      let url = '/alertas'

      if (usuario?.perfil === 'atleta') {
        url = `/alertas/atleta/${usuario.id}`
      }

      if (usuario?.perfil === 'tecnico' && atletaSelecionado?.id) {
        url = `/alertas/atleta/${atletaSelecionado.id}`
      }

      const response = await api.get(url)
      setAlertas(response.data || [])
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

                <RiskBadge risco={alerta.nivel_risco} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Alertas