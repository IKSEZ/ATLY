import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Calendar,
  Dumbbell
} from 'lucide-react'
import { mockMapaCorporal, mockDashboard, mockTreinos } from '../mocks/mockData'

function HumanBody3D() {
  const [zoom, setZoom] = useState(100)
  const [visao, setVisao] = useState('frente')

  const alertas = mockMapaCorporal.alertas
  const regioes = mockMapaCorporal.regioes

  return (
    <section className="body3d-page">
      <div className="body3d-main">
        <div className="body3d-header">
          <div>
            <h1>Corpo 3D - Mapa de Calor</h1>
            <p>Visualização detalhada das regiões corporais e níveis de risco</p>
          </div>

          <button className="date-button">
            <Calendar size={18} />
            09/05/2024 - Hoje
          </button>
        </div>

        <div className="body3d-viewer">
          <div className="body3d-image-wrapper">
            <img
              src="/human-body-3d.png"
              alt="Mapa corporal 3D"
              className="body3d-image"
              style={{ transform: `scale(${zoom / 100})` }}
            />

            <div className="hotspot hotspot-ombro-esq risco-alto" />
            <div className="hotspot hotspot-ombro-dir risco-medio" />
            <div className="hotspot hotspot-peito risco-baixo" />
            <div className="hotspot hotspot-coxa-esq risco-alto" />
            <div className="hotspot hotspot-coxa-dir risco-alto" />
            <div className="hotspot hotspot-panturrilha-esq risco-atencao" />
            <div className="hotspot hotspot-panturrilha-dir risco-atencao" />
          </div>

          <div className="rotate-badge">
            <RotateCcw size={32} />
            <span>360°</span>
          </div>

          <div className="body3d-tabs">
            <button
              className={visao === 'frente' ? 'active' : ''}
              onClick={() => setVisao('frente')}
            >
              Frente
            </button>

            <button
              className={visao === 'esquerdo' ? 'active' : ''}
              onClick={() => setVisao('esquerdo')}
            >
              Lado Esquerdo
            </button>

            <button
              className={visao === 'direito' ? 'active' : ''}
              onClick={() => setVisao('direito')}
            >
              Lado Direito
            </button>
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
            <h2 className="danger-text">{mockDashboard.acwr}</h2>

            <div className="risk-bar">
              <div className="risk-fill" />
            </div>

            <p>Ideal: 0.8 - 1.3</p>
          </div>

          <div className="metric-card">
            <span>Carga Aguda (7 dias)</span>
            <h2>{mockDashboard.cargaAguda} <small>u.a.</small></h2>
            <div className="mini-chart" />
          </div>

          <div className="metric-card">
            <span>Carga Crônica (28 dias)</span>
            <h2>{mockDashboard.cargaCronica} <small>u.a.</small></h2>
            <div className="mini-chart" />
          </div>

          <div className="metric-card center">
            <span>Nível de Risco Geral</span>
            <strong className="risk-big">{mockDashboard.risco}</strong>
            <p>Recomenda atenção imediata</p>
          </div>

          <div className="metric-card">
            <span>Último Treino</span>
            <h2>Hoje</h2>
            <p>{mockTreinos[0]?.data} - 18:30</p>
            <Dumbbell className="green-icon" size={34} />
          </div>
        </div>
      </div>

      <aside className="body3d-side">
        <div className="side-card alerts-card">
          <div className="side-title">
            <AlertTriangle />
            <h3>Alertas Ativos</h3>
            <strong>{alertas.length}</strong>
          </div>

            {alertas.map((alerta) => (
            <div className={`alert-body-item ${alerta.tipo}`} key={alerta.id}>
              <div>
                <h4>{alerta.area}</h4>
                <p>{alerta.descricao}</p>
              </div>

              <span>{alerta.nivel}</span>
            </div>
          ))}
        </div>

        <div className="side-card">
          <h3>Legenda - Nível de Risco</h3>

          <div className="legend">
            <span><i className="dot baixo" /> Seguro</span>
            <span><i className="dot atencao" /> Atenção</span>
            <span><i className="dot medio" /> Alto</span>
            <span><i className="dot alto" /> Crítico</span>
          </div>
        </div>

        <div className="side-card">
          <h3>Regiões em Destaque</h3>

          <div className="regions-list">
            {regioes.map((regiao) => (
              <div key={regiao.nome}>
                <span>
                  <i className={`dot ${regiao.tipo}`} />
                  {regiao.nome}
                </span>

                <strong className={regiao.tipo}>{regiao.nivel}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="side-card muscle-map">
          <h3>Mapa por Músculo</h3>

          <div className="muscle-placeholder">
            <CheckCircle />
            <p>Mapa muscular sincronizado com alertas</p>
          </div>
        </div>
      </aside>
    </section>
  )
}

export default HumanBody3D