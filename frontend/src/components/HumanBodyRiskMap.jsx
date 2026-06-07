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

    return 'baixo'
  }

  return (
    <section className="body3d-page">
      <div className="body3d-main">
        <div className="body3d-header">
          <div>
            <h1>Corpo 3D - Mapa de Calor</h1>
            <p>Regiões corporais com risco conforme o nível atual do atleta</p>
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
                      className={`hotspot risco-${classeRisco(regiao.nivel)}${regiaoSelecionada?.id === regiao.id ? ' hotspot-selected' : ''}`}
                      style={{
                        left: `${regiao.x}%`,
                        top: `${regiao.y}%`
                      }}
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

                {regiaoSelecionada ? (
                  <>
                    <strong>{regiaoSelecionada.nome}</strong>
                    <p>{regiaoSelecionada.descricao || 'Sem observação cadastrada.'}</p>
                    <small className={classeRisco(regiaoSelecionada.nivel)}>
                      {regiaoSelecionada.nivel}
                    </small>
                  </>
                ) : (
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
            <p>Mapa ilustrativo sincronizado com o nível de risco atual</p>
          </div>
        </div>
      </aside>
    </section>
  )
}

export default HumanBody3D