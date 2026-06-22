import { useState } from 'react'
import api from '../services/api'

function VincularAtleta() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')

  async function handleVincular(e) {
    e.preventDefault()
    setLoading(true)
    setMensagemErro('')
    setMensagemSucesso('')

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // 1. Usa a sua rota GET '/' padrão de atletas para pegar a lista
      const responseListar = await api.get('/atletas', { headers })
      const listaAtletas = responseListar.data?.atletas || []

      // 2. Procura na lista existente o atleta que tem o e-mail digitado
      const atletaEncontrado = listaAtletas.find(
        (a) => String(a.email).toLowerCase().trim() === email.toLowerCase().trim()
      )

      if (!atletaEncontrado) {
        setMensagemErro('Atleta não localizado ou não disponível para vinculação.')
        setLoading(false)
        return
      }

      // 3. Com o ID em mãos, faz o POST na sua rota oficial de ID nativa!
      const responseVinculo = await api.post(
        `/atletas/${atletaEncontrado.id}/vincular`,
        {},
        { headers }
      )

      setMensagemSucesso(responseVinculo.data?.mensagem || 'Atleta vinculado com sucesso!')
      setEmail('')
    } catch (err) {
      if (err.response?.data?.erro) {
        setMensagemErro(err.response.data.erro)
      } else {
        setMensagemErro('Erro ao processar a vinculação do atleta.')
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

        <button type="submit" disabled={loading}>
          {loading ? 'Processando Vínculo...' : 'Vincular Atleta'}
        </button>
      </form>
    </div>
  )
}

export default VincularAtleta