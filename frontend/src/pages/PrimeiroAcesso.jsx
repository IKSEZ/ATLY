import { useState } from 'react'
import api from '../services/api'
import { KeyRound } from 'lucide-react'


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
    <section 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-color, #05010d)',
        padding: '20px'
      }}
    >
      <div 
        style={{
          background: 'var(--card-light, #130a2a)',
          border: '1px solid var(--border, #2a1f4c)',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <div 
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '16px',
            borderRadius: '50%',
            marginBottom: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <KeyRound size={32} color="var(--primary, #8b5cf6)" />
        </div>

        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: 'var(--text, #ffffff)', 
          margin: '0 0 10px 0' 
        }}>
          Bem-vindo ao ATLY!
        </h1>
        
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--muted, #9ca3af)', 
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          Você está usando uma senha temporária. Defina uma senha pessoal forte para continuar e garantir a segurança dos seus dados.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted, #9ca3af)', marginBottom: '6px', fontWeight: '500' }}>
              Senha temporária
            </label>
            <input
              name="senha_atual"
              type="password"
              placeholder="Digite a senha recebida"
              value={form.senha_atual}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(5, 1, 13, 0.4)',
                border: '1px solid var(--border, #2a1f4c)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted, #9ca3af)', marginBottom: '6px', fontWeight: '500' }}>
              Nova senha
            </label>
            <input
              name="nova_senha"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              value={form.nova_senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(5, 1, 13, 0.4)',
                border: '1px solid var(--border, #2a1f4c)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted, #9ca3af)', marginBottom: '6px', fontWeight: '500' }}>
              Confirmar nova senha
            </label>
            <input
              name="confirmar_senha"
              type="password"
              placeholder="Repita a nova senha"
              value={form.confirmar_senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(5, 1, 13, 0.4)',
                border: '1px solid var(--border, #2a1f4c)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {erro && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              padding: '10px', 
              borderRadius: '8px', 
              fontSize: '13px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginTop: '5px'
            }}>
              {erro}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '10px',
              width: '100%',
              background: 'linear-gradient(135deg, var(--primary, #8b5cf6), var(--primary-light, #a78bfa))',
              color: '#ffffff',
              border: 'none',
              padding: '14px 0',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Salvando...' : 'Definir minha senha'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default PrimeiroAcesso
