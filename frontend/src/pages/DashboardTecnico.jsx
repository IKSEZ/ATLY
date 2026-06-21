import { useEffect, useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import RiskBadge from '../components/RiskBadge'
import { User } from 'lucide-react'

function DashboardTecnico({ tecnicoId, setTela, setAtletaSelecionado }) {
  const [atletas, setAtletas] = useState([])
  const [loading, setLoading] = useState(true)

async function carregarAtletas() {
    try {
      // Adicionamos o timestamp na URL. Isso engana o cache do navegador sem quebrar o CORS!
      const response = await api.get(`/atletas?_t=${Date.now()}`)
      
      console.log('Resposta da API /atletas:', response.data)

      if (response.data && response.data.atletas) {
        setAtletas(response.data.atletas)
      } else if (Array.isArray(response.data)) {
        setAtletas(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setAtletas(response.data.data)
      } else {
        setAtletas([])
      }

    } catch (error) {
      console.error('Erro ao buscar atletas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAtletas()
  }, [tecnicoId])

  function abrirAtleta(atleta) {
    setAtletaSelecionado(atleta.id)
    setTela('detalhes-atleta')
  }

  return (
    <section>
      <Header
        titulo="Painel Técnico"
        subtitulo="Acompanhe os atletas vinculados e seus níveis de risco."
      />

      {/* Container usando as classes nativas do seu App.css */}
      <div className="card full-card">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text)', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '10px'
        }}>
          Atletas Monitorados
        </h3>

        {loading ? (
          <div className="empty-state">Carregando atletas...</div>
        ) : !atletas.length ? (
          <div className="empty-state">Nenhum atleta vinculado.</div>
        ) : (
          <div className="athletes-grid">
            {atletas.map((atleta) => (
              <div 
                key={atleta.id} 
                className="athlete-card"
                style={{
                  background: 'var(--card-light)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Linha Superior: Avatar + Informações Principais */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    backgroundColor: 'var(--purple-dark)',
                    border: '1px solid var(--border)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={18} color="var(--muted)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {atleta.nome || 'Atleta sem nome'}
                    </h4>
                    <p style={{ 
                      margin: '2px 0 0 0', 
                      fontSize: '13px', 
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {atleta.email || 'Sem email cadastrado'}
                    </p>
                  </div>
                </div>

                {/* Linha Central: Distintivo de Nível de Risco */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(5, 1, 13, 0.4)',
                  borderRadius: '10px',
                  border: '1px solid rgba(168, 85, 247, 0.1)'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>
                    Nível de Risco:
                  </span>
                  <RiskBadge risco={atleta.nivel_risco} />
                </div>

                {/* Linha Inferior: Botão Temático Cyberpunk */}
                <button
                  onClick={() => abrirAtleta(atleta)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(109, 40, 217, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.filter = 'brightness(1.15)'}
                  onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
                >
                  Verificar Performance
                </button>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DashboardTecnico