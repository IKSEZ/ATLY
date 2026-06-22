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
      
      // Envia APENAS o e-mail dentro da rota de vínculo normal
      const response = await api.post('/tecnicos/vincular-atleta', { 
        email: email.trim() 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // O backend processou o e-mail, vinculou e nos devolveu o ID do sistema!
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
    <div className="card" style={{ maxWidth: '500px', padding: '24px' }}>
      <h3>Vincular Novo Atleta</h3>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
        Insira o e-mail cadastrado do atleta para localizá-lo e vinculá-lo à sua equipe.
      </p>
      
      <form onSubmit={handleVincular} className="form-card">
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
          <div className="error-message" style={{ padding: '10px', fontSize: '14px', marginTop: '10px' }}>
            {mensagemErro}
          </div>
        )}

        {mensagemSucesso && (
          <div className="success-message" style={{ padding: '10px', fontSize: '14px', marginTop: '10px' }}>
            {mensagemSucesso}
          </div>
        )}

        {atletaInfo && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)' }}>
            <strong>Dados do Vínculo Gerado:</strong><br />
            ID do Atleta no Banco: #{atletaInfo.id}<br />
            Nome Completo: {atletaInfo.nome}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ marginTop: '16px', width: '100%' }}
        >
          {loading ? 'Processando Vínculo...' : 'Vincular Atleta'}
        </button>
      </form>
    </div>
  )
}

export default VincularAtleta