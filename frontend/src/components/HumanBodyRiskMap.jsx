<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import api from '../services/api'

// atletaId: ID do atleta — busca do endpoint GET /atletas/:id/mapa-corporal
function HumanBodyRiskMap({ atletaId }) {
  const [dados, setDados] = useState({ regioes: [], alertas: [] })
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!atletaId) return

    async function buscarMapa() {
      setLoading(true)
      setErro('')

      try {
        const response = await api.get(`/atletas/${atletaId}/mapa-corporal`)
        const { regioes, alertas } = response.data

        setDados({ regioes, alertas })
        setRegiaoSelecionada(regioes[0] || null)
      } catch (err) {
        setErro('Não foi possível carregar o mapa corporal.')
      } finally {
        setLoading(false)
      }
    }

    buscarMapa()
  }, [atletaId])

  function classeRisco(nivel) {
    const n = String(nivel || '').toLowerCase()
    if (n.includes('alto'))                          return 'alto'
    if (n.includes('moderado') || n.includes('medio') || n.includes('médio')) return 'medio'
    if (n.includes('aten'))                          return 'atencao'
=======
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { mockMapaCorporal } from '../mocks/mockData'

function HumanBody3D({ risco }) {
  const riscoNormalizado = String(risco || '').toLowerCase()

  const dados = useMemo(() => {
    if (riscoNormalizado === 'alto') {
      return {
        alertas: [
          { id: 1, area: 'Joelho Direito', descricao: 'Sobrecarga detectada', nivel: 'alto' },
          { id: 2, area: 'Posterior de Coxa', descricao: 'Fadiga acumulada', nivel: 'medio' },
        ],
        regioes: [
          { id: 1, nome: 'Joelho Direito', descricao: 'Sobrecarga', nivel: 'alto', x: 55, y: 70 },
          { id: 2, nome: 'Posterior de Coxa', descricao: 'Fadiga', nivel: 'medio', x: 50, y: 58 },
        ],
      }
    }

    if (riscoNormalizado === 'atencao' || riscoNormalizado === 'atenção') {
      return {
        alertas: [
          { id: 1, area: 'Panturrilha', descricao: 'Atenção à recuperação', nivel: 'atencao' },
        ],
        regioes: [
          { id: 1, nome: 'Panturrilha', descricao: 'Atenção', nivel: 'atencao', x: 48, y: 78 },
        ],
      }
    }

    return mockMapaCorporal
  }, [riscoNormalizado])

  const [regiaoSelecionada, setRegiaoSelecionada] = useState(dados.regioes[0] || null)

  useEffect(() => {
    setRegiaoSelecionada(dados.regioes[0] || null)
  }, [dados])

  const loading = false
  const erro = ''

  function classeRisco(nivel) {
    const risco = String(nivel || '').toLowerCase()

    if (risco.includes('alto')) return 'alto'
    if (risco.includes('medio') || risco.includes('médio')) return 'medio'
    if (risco.includes('aten')) return 'atencao'
    if (risco.includes('baixo')) return 'baixo'

>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
    return 'baixo'
  }

  return (
    <section className="body3d-page">
      <div className="body3d-main">
        <div className="body3d-header">
          <div>
            <h1>Corpo 3D - Mapa de Calor</h1>
<<<<<<< HEAD
            <p>Regiões corporais com risco conforme o histórico e análise do atleta</p>
=======
            <p>Regiões corporais com risco conforme o nível atual do atleta</p>
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
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
<<<<<<< HEAD
                      className={`hotspot risco-${classeRisco(regiao.nivel)}${
                        regiaoSelecionada?.id === regiao.id ? ' hotspot-selected' : ''
                      }`}
                      style={{ left: `${regiao.x}%`, top: `${regiao.y}%` }}
=======
                      className={`hotspot risco-${classeRisco(regiao.nivel)}${regiaoSelecionada?.id === regiao.id ? ' hotspot-selected' : ''}`}
                      style={{
                        left: `${regiao.x}%`,
                        top: `${regiao.y}%`
                      }}
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
                      onClick={() => setRegiaoSelecionada(regiao)}
                      aria-label={`Ver detalhes de ${regiao.nome}`}
                      title={`${regiao.nome} - ${regiao.nivel}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="body3d-details">
              <div className="card full-card">
                <h3>Região em foco</h3>
<<<<<<< HEAD
=======

>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
                {regiaoSelecionada ? (
                  <>
                    <strong>{regiaoSelecionada.nome}</strong>
                    <p>{regiaoSelecionada.descricao || 'Sem observação cadastrada.'}</p>
                    <small className={classeRisco(regiaoSelecionada.nivel)}>
                      {regiaoSelecionada.nivel}
                    </small>
                  </>
                ) : (
<<<<<<< HEAD
                  <p>
                    {dados.regioes.length === 0
                      ? 'Nenhuma região de risco identificada para este atleta.'
                      : 'Selecione uma região no mapa para ver os detalhes.'}
                  </p>
                )}
              </div>

              {dados.regioes.map((regiao) => (
                <button
                  type="button"
                  className={`region-card${
                    regiaoSelecionada?.id === regiao.id ? ' selected' : ''
                  }`}
                  key={regiao.id}
                  onClick={() => setRegiaoSelecionada(regiao)}
                >
                  <span className={`dot ${classeRisco(regiao.nivel)}`} />
                  <div>
                    <strong>{regiao.nome}</strong>
                    <p>{regiao.descricao || 'Sem observação cadastrada.'}</p>
                  </div>
                  <small className={classeRisco(regiao.nivel)}>{regiao.nivel}</small>
                </button>
              ))}
=======
                  <p>Selecione uma região no mapa para ver os detalhes.</p>
                )}
              </div>

              {dados.regioes.length === 0 ? (
                <div className="empty-state">
                  Nenhuma região de risco registrada para este atleta.
                </div>
              ) : (
                dados.regioes.map((regiao) => (
                  <button
                    type="button"
                    className={`region-card${regiaoSelecionada?.id === regiao.id ? ' selected' : ''}`}
                    key={regiao.id}
                    onClick={() => setRegiaoSelecionada(regiao)}
                  >
                    <span className={`dot ${classeRisco(regiao.nivel)}`} />
                    <div>
                      <strong>{regiao.nome}</strong>
                      <p>{regiao.descricao || 'Sem observação cadastrada.'}</p>
                    </div>
                    <small className={classeRisco(regiao.nivel)}>
                      {regiao.nivel}
                    </small>
                  </button>
                ))
              )}
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
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
<<<<<<< HEAD
            <div className="empty-side">Nenhum alerta ativo.</div>
=======
            <div className="empty-side">
              Nenhum alerta ativo.
            </div>
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
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
<<<<<<< HEAD
=======

>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
                <span>{alerta.nivel}</span>
              </div>
            ))
          )}
        </div>

        <div className="side-card">
          <h3>Legenda - Nível de Risco</h3>
<<<<<<< HEAD
=======

>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
          <div className="legend">
            <span><i className="dot baixo" /> Baixo</span>
            <span><i className="dot atencao" /> Atenção</span>
            <span><i className="dot medio" /> Médio</span>
            <span><i className="dot alto" /> Alto</span>
          </div>
        </div>

        <div className="side-card muscle-map">
          <h3>Status do Mapa</h3>
<<<<<<< HEAD
          <div className="muscle-placeholder">
            <CheckCircle />
            <p>Mapa sincronizado com histórico de lesões e análise de risco</p>
=======

          <div className="muscle-placeholder">
            <CheckCircle />
            <p>Mapa ilustrativo sincronizado com o nível de risco atual</p>
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
          </div>
        </div>
      </aside>
    </section>
  )
}

<<<<<<< HEAD
export default HumanBodyRiskMap
=======
export default HumanBody3D
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
