import { useState } from 'react'
import api from '../services/api'

function VincularAtleta() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [atletaInfo, setAtletaInfo] = useState(null)

  async function handleVincular(e) {
    e.preventDefault()
    setLoading(true)
    setMensagemErro('')
    setMensagemSucesso('')
    setAtletaInfo(null)

    try {
      const token = localStorage.getItem('token')
      
      // Faz o POST passando o e-mail estruturado para o backend interceptar e vincular
      const response = await api.post('/tecnicos/vincular-atleta', { 
        email: email.trim() 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMensagemSucesso(response.data.mensagem)
      setAtletaInfo(response.data.atleta) // Contém { id, nome }
      setEmail('')
    } catch (err) {
      if (err.response?.data?.erro) {
        setMensagemErro(err.response.data.erro)
      } else {
        setMensagemErro('Falha ao conectar com o servidor de vinculação.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <h3>Vincular Novo Atleta</h3>
      <p>Insira o e-mail cadastrado do atleta para localizá-lo e vinculá-lo à sua equipe.</p>
      
      <form onSubmit={handleVincular}>
        <label>
          E-mail do Atleta
          <input
            type="email"
            placeholder="exemplo@atleta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {mensagemErro && (
          <div className="error-message">
            {mensagemErro}
          </div>
        )}

        {mensagemSucesso && (
          <div className="success-message">
            {mensagemSucesso}
          </div>
        )}

        {atletaInfo && (
          <div className="success-message" style={{ background: 'rgba(168, 85, 247, 0.08)', borderColor: 'var(--border)' }}>
            <strong>Vínculo Realizado:</strong> #{atletaInfo.id} - {atletaInfo.nome}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Processando Vínculo...' : 'Vincular Atleta'}
        </button>
      </form>
    </div>
  )
}

export default VincularAtleta