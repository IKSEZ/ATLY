import { useState } from 'react'
import api from '../services/api'

// Exibido logo após o login quando usuario.senha_provisoria === true
// onSenhaTrocada: callback chamado após sucesso (ex: redirecionar para dashboard)
function PrimeiroAcesso({ onSenhaTrocada }) {
  const [form, setForm] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: '',
  })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (form.nova_senha !== form.confirmar_senha) {
      return setErro('A nova senha e a confirmação não coincidem.')
    }

    if (form.nova_senha.length < 8) {
      return setErro('A nova senha deve ter no mínimo 8 caracteres.')
    }

    setLoading(true)
    try {
      await api.post('/auth/definir-senha', {
        senha_atual: form.senha_atual,
        nova_senha: form.nova_senha,
      })

      onSenhaTrocada()
    } catch (err) {
      const mensagem = err.response?.data?.erro || 'Erro ao definir a senha.'
      setErro(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="primeiro-acesso-page">
      <div className="card form-card">
        <h1>Bem-vindo ao Atly!</h1>
        <p>
          Você está usando uma senha temporária. Defina uma senha pessoal
          para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Senha temporária</label>
          <input
            name="senha_atual"
            type="password"
            placeholder="Digite a senha que você recebeu"
            value={form.senha_atual}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <label>Nova senha</label>
          <input
            name="nova_senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.nova_senha}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <label>Confirmar nova senha</label>
          <input
            name="confirmar_senha"
            type="password"
            placeholder="Repita a nova senha"
            value={form.confirmar_senha}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          {erro && <div className="error-message">{erro}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Definir minha senha'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default PrimeiroAcesso