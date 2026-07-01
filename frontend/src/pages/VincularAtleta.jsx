import { useState } from 'react'
import api from '../services/api'
import { Link2, ArrowRight } from 'lucide-react'

function VincularAtleta({ tecnicoId }) {
  const [atletaId, setAtletaId] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleVincular(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      await api.post(`/atletas/${atletaId}/vincular`, {
        tecnicoId: tecnicoId 
      })

      setSucesso('Atleta vinculado com sucesso à sua lista!')
      setAtletaId('')
    } catch (error) {
      console.error('Erro ao vincular atleta:', error)
      const msg = error.response?.data?.erro || error.response?.data?.mensagem || 'Erro ao vincular atleta. Verifique o ID.'
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }} className="card form-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Link2 size={24} color="#007bff" />
        <h1 style={{ margin: 0 }}>Vincular Atleta Existente</h1>
      </div>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Insira o identificador único do atleta para adicioná-lo ao seu monitoramento.
      </p>

      <form onSubmit={handleVincular} className="login-form-clean" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          ID do Atleta
          <input
            type="text"
            placeholder="Ex: 12345 ou uuid-do-atleta"
            value={atletaId}
            onChange={(e) => setAtletaId(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {erro && <div className="login-error-clean" style={{ color: 'red', fontSize: '14px' }}>{erro}</div>}
        {sucesso && <div style={{ color: 'green', fontSize: '14px', fontWeight: 'bold' }}>{sucesso}</div>}

        <button
          type="submit"
          className="login-main-button"
          disabled={carregando}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
        >
          {carregando ? 'Vinculando...' : 'Vincular Atleta'}
          {!carregando && <ArrowRight size={19} />}
        </button>
      </form>
    </div>
  )
}

export default VincularAtleta
