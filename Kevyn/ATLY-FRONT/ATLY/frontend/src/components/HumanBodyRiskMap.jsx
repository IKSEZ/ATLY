import { useEffect, useState } from 'react'
import api from '../services/api'
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

function HumanBody3D({ atletaId }) {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [dados, setDados] = useState({
    alertas: [],
    regioes: []
  })

  async function carregarMapaCorporal() {
    try {
      setLoading(true)
      setErro('')

      const response = await api.get(`/atletas/${atletaId}/mapa-corporal`)

      setDados({
        alertas: response.data.alertas || [],
        regioes: response.data.regioes || []
      })
    } catch (error) {
      console.error('Erro ao carregar mapa corporal:', error)
      setErro('Não foi possível carregar o mapa corporal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (atletaId) {
      carregarMapaCorporal()
    }
  }, [atletaId])

  function classeRisco(nivel) {
    const risco = String(nivel || '').toLowerCase()

    if (risco.includes('alto')) return 'alto'
    if (risco.includes('medio') || risco.includes('médio')) return 'medio'
    if (risco.includes('aten')) return 'atencao'
    if (risco.includes('baixo')) return 'baixo'

    return 'baixo'
  }

  return (
    <section className="body3d-page">
      <div className="body3d-main">
        <div className="body3d-header">
          <div>
            <h1>Corpo 3D - Mapa de Calor</h1>
            <p>Regiões corporais com risco conforme dados do atleta</p>
          </div>
        </div>

        {loading && (
          <div className="empty-state">Carregando mapa corporal...</div>
        )}

        {erro && (
          <div className="error-message">{erro}</div>
        )}

        {!loading && !erro && (
          <>
            <div className="body3d-viewer">
              <div className="body3d-image-area">
                <img
                  src="/human-body-3d.png"
                  alt="Mapa corporal 3D"
                  className="body3d-image"
                />

                <div className="body3d-heatmap-layer">
                  {dados.regioes.map((regiao) => (
                    <button
                      key={regiao.id}
                      className={`hotspot risco-${classeRisco(regiao.nivel)}`}
                      style={{
                        left: `${regiao.x}%`,
                        top: `${regiao.y}%`
                      }}
                      title={`${regiao.nome} - ${regiao.nivel}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="body3d-details">
              {dados.regioes.length === 0 ? (
                <div className="empty-state">
                  Nenhuma região de risco registrada para este atleta.
                </div>
              ) : (
                dados.regioes.map((regiao) => (
                  <div className="region-card" key={regiao.id}>
                    <span className={`dot ${classeRisco(regiao.nivel)}`} />
                    <div>
                      <strong>{regiao.nome}</strong>
                      <p>{regiao.descricao || 'Sem observação cadastrada.'}</p>
                    </div>
                    <small className={classeRisco(regiao.nivel)}>
                      {regiao.nivel}
                    </small>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <aside className="body3d-side">
        <div className="side-card alerts-card">
          <div className="side-title">
            <AlertTriangle />
            <h3>Alertas Ativos</h3>
            <strong>{dados.alertas.length}</strong>
          </div>

          {dados.alertas.length === 0 ? (
            <div className="empty-side">
              Nenhum alerta ativo.
            </div>
          ) : (
            dados.alertas.map((alerta) => (
              <div
                className={`alert-body-item ${classeRisco(alerta.nivel)}`}
                key={alerta.id}
              >
                <div>
                  <h4>{alerta.area}</h4>
                  <p>{alerta.descricao}</p>
                </div>

                <span>{alerta.nivel}</span>
              </div>
            ))
          )}
        </div>

        <div className="side-card">
          <h3>Legenda - Nível de Risco</h3>

          <div className="legend">
            <span><i className="dot baixo" /> Baixo</span>
            <span><i className="dot atencao" /> Atenção</span>
            <span><i className="dot medio" /> Médio</span>
            <span><i className="dot alto" /> Alto</span>
          </div>
        </div>

        <div className="side-card muscle-map">
          <h3>Status do Mapa</h3>

          <div className="muscle-placeholder">
            <CheckCircle />
            <p>Mapa sincronizado com o backend do atleta</p>
          </div>
        </div>
      </aside>
    </section>
  )
}

export default HumanBody3D