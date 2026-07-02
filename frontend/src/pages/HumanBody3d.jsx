import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Calendar,
  Dumbbell
} from 'lucide-react'
import api from '../services/api'
import TrainingTable from '../components/TrainingTable'

const coordenadasExatas = {
  'cabeca': { x: 50, y: 9 },
  'cabeça': { x: 50, y: 9 },
  'pescoço': { x: 50, y: 15 },
  'pescoco': { x: 50, y: 15 },
  'ombro': { x: 41, y: 22 },
  'peito': { x: 50, y: 27 },
  'peitoral': { x: 50, y: 27 },
  'abdomen': { x: 50, y: 38 },
  'abdômen': { x: 50, y: 38 },
  'quadril': { x: 50, y: 48 },
  'coxa': { x: 45, y: 61 },
  'quadriceps': { x: 45, y: 61 },
  'coxa / quadriceps': { x: 45, y: 61 },
  'joelho': { x: 45, y: 73 },      
  'panturrilha': { x: 45, y: 83 },
  'tornozelo': { x: 45, y: 92 },
  'pe': { x: 45, y: 96 },
  'pé': { x: 45, y: 96 },

  
  'braco': { x: 34, y: 35 },
  'braço': { x: 34, y: 35 },
  'cotovelo': { x: 31, y: 44 },
  'punho': { x: 28, y: 53 },
  'mao': { x: 27, y: 59 },
  'mão': { x: 27, y: 59 },


  'costas': { x: 86, y: 28 },
  'lombar': { x: 87, y: 40 },
  'gluteo': { x: 88, y: 48 },
  'glúteo': { x: 88, y: 48 },
  'posterior': { x: 87, y: 61 },
  'posterior da coxa': { x: 87, y: 61 }
}

function HumanBody3D({ atletaId }) {
  const [zoom, setZoom] = useState(100)
  const [dadosMapa, setDadosMapa] = useState({ regioes: [], alertas: [] })
  const [analise, setAnalise] = useState(null)
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!atletaId) return

    async function buscarDados() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        const [resMapa, resAnalise, resTreinos] = await Promise.all([
          api.get(`/atletas/${atletaId}/mapa-corporal`, { headers }),
          api.get(`/treinos/atleta/${atletaId}/analise`, { headers }).catch(() => ({ data: {} })),
          api.get(`/treinos/atleta/${atletaId}`, { headers }).catch(() => ({ data: { treinos: [] } }))
        ])

        setDadosMapa({
          regioes: resMapa.data?.regioes || [],
          alertas: resMapa.data?.alertas || []
        })
        const dadosAnalise = resAnalise.data?.analise || resAnalise.data || {}
        setAnalise(dadosAnalise)

        const listaTreinos = dadosAnalise.treinos || resTreinos.data?.treinos || resTreinos.data || []
        setTreinos(listaTreinos)

      } catch (err) {
        console.error("Erro ao carregar Corpo 3D real:", err)
      } finally {
        setLoading(false)
      }
    }

    buscarDados()
  }, [atletaId])

  function classeRisco(nivel) {
    const n = String(nivel || '').toLowerCase()
    if (n.includes('alto')) return 'alto'
    if (n.includes('moderado') || n.includes('medio') || n.includes('médio')) return 'medio'
    if (n.includes('aten')) return 'atencao'
    return 'baixo'
  }

  function obterPosicao(regiao) {
    const nomeLimpo = String(regiao.nome || '').toLowerCase().trim()
    if (coordenadasExatas[nomeLimpo]) {
      return { x: coordenadasExatas[nomeLimpo].x, y: coordenadasExatas[nomeLimpo].y }
    }
    return { x: regiao.x, y: regiao.y }
  }

  const ultimoTreino = treinos.length > 0 ? treinos[treinos.length - 1] : null

  if (loading) {
    return (
      <section className="body3d-page">
        <div className="empty-state">Carregando mapa corporal e sincronizando IA...</div>
      </section>
    )
  }

  return (
    <section className="body3d-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 370px', gap: '20px', width: '100%' }}>

        <div className="body3d-main">
          <div className="body3d-header">
            <div>
              <h1>Corpo 3D - Mapa de Calor</h1>
              <p>Visualização detalhada das regiões corporais e níveis de risco</p>
            </div>

            <button className="date-button">
              <Calendar size={18} />
              {new Date().toLocaleDateString('pt-BR')} - Hoje
            </button>
          </div>

          <div className="body3d-viewer">
            <div 
              className="body3d-image-area" 
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top center', 
                transition: 'transform 0.3s ease' 
              }}
            >
              <img
                src="/human-body-3d.png"
                alt="Mapa corporal 3D"
                className="body3d-image"
              />

              <div className="body3d-heatmap-layer">
                {dadosMapa.regioes.map((regiao) => {
                  const posicao = obterPosicao(regiao);
                  return (
                    <div
                      key={regiao.id || Math.random()}
                      className={`hotspot risco-${classeRisco(regiao.nivel)}`}
                      style={{ left: `${posicao.x}%`, top: `${posicao.y}%`, position: 'absolute' }}
                      title={`${regiao.nome} - ${regiao.nivel}`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="zoom-control">
              <button onClick={() => setZoom(Math.max(80, zoom - 10))}>
                <ZoomOut size={16} />
              </button>
              <span>{zoom}%</span>
              <button onClick={() => setZoom(Math.min(130, zoom + 10))}>
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="body3d-metrics">
            <div className="metric-card">
              <span>Índice ACWR</span>
              <h2 className={classeRisco(analise?.nivel_risco) === 'alto' ? 'danger-text' : ''}>
                {analise?.acwr ?? '--'}
              </h2>
              <div className="risk-bar">
                <div className={`bg-${classeRisco(analise?.nivel_risco)}`} style={{ width: '100%', height: '100%' }} />
              </div>
              <p>Ideal: 0.8 - 1.3</p>
            </div>

            <div className="metric-card">
              <span>Carga Aguda (7 dias)</span>
              <h2>{analise?.carga_aguda || analise?.carga_aguda_media || '0'} <small>u.a.</small></h2>
            </div>

            <div className="metric-card">
              <span>Carga Crônica (28 dias)</span>
              <h2>{analise?.carga_cronica || analise?.carga_cronica_media || '0'} <small>u.a.</small></h2>
            </div>

            <div className="metric-card center">
              <span>Nível de Risco Geral</span>
              <strong className={`risk-big bg-${classeRisco(analise?.nivel_risco)}`}>
                {analise?.nivel_risco || 'baixo'}
              </strong>
              <p>{analise?.nivel_risco === 'alto' ? 'Recomenda atenção imediata' : 'Volume seguro'}</p>
            </div>

            <div className="metric-card">
              <span>Último Treino</span>
              {ultimoTreino ? (
                <>
                  <h2>{ultimoTreino.carga} <small>u.a.</small></h2>
                  <p>{new Date(ultimoTreino.data_treino).toLocaleDateString('pt-BR')}</p>
                </>
              ) : (
                <>
                  <h2>--</h2>
                  <p>Nenhum registro</p>
                </>
              )}
              <Dumbbell className={ultimoTreino ? 'green-icon' : ''} size={34} />
            </div>
          </div>
        </div>

        <aside className="body3d-side">
          <div className="side-card alerts-card">
            <div className="side-title">
              <AlertTriangle />
              <h3>Alertas Ativos</h3>
              <strong>{dadosMapa.alertas?.length || 0}</strong>
            </div>

            {dadosMapa.alertas?.length === 0 ? (
              <p className="empty-side" style={{ padding: '20px 0', color: 'var(--muted)', textAlign: 'center' }}>Nenhum alerta ativo.</p>
            ) : (
              dadosMapa.alertas.map((alerta) => (
                <div className={`alert-body-item ${classeRisco(alerta.nivel)}`} key={alerta.id || Math.random()}>
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
              <span><i className="dot baixo" /> Seguro</span>
              <span><i className="dot atencao" /> Atenção</span>
              <span><i className="dot medio" /> Médio</span>
              <span><i className="dot alto" /> Crítico</span>
            </div>
          </div>

          <div className="side-card">
            <h3>Regiões em Destaque</h3>
            <div className="regions-list">
              {dadosMapa.regioes?.length === 0 ? (
                <p className="empty-side" style={{ padding: '10px 0', color: 'var(--muted)', textAlign: 'center' }}>Nenhuma região em risco mapeada.</p>
              ) : (
                dadosMapa.regioes.map((regiao) => (
                  <div key={regiao.nome}>
                    <span>
                      <i className={`dot ${classeRisco(regiao.nivel)}`} />
                      {regiao.nome}
                    </span>
                    <strong className={classeRisco(regiao.nivel)}>{regiao.nivel}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>

      <div className="card full-card" style={{ width: '100%' }}>
        <h3>Histórico Completo de Treinos</h3>
        <TrainingTable treinos={treinos} riscoGeral={analise?.nivel_risco || 'baixo'} />
      </div>

    </section>
  )
}

export default HumanBody3D
