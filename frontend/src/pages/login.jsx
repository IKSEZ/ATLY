import { useState } from 'react'
import api from '../services/api'
import {
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react'

// Adicionada a prop onAlternarParaCadastro
function Login({ onLoginSuccess, onAlternarParaCadastro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function fazerLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const resposta = await api.post('/auth/login', {
        email,
        senha
      })

      const { accessToken, token, usuario } = resposta.data
      const tokenAutenticacao = accessToken || token

      localStorage.setItem('token', tokenAutenticacao)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      onLoginSuccess(usuario)
    } catch (error) {
      console.error('Erro no login:', error)

      if (error.response?.status === 429) {
        setErro('Conta bloqueada temporariamente. Tente novamente em 15 minutos.')
      } else {
        setErro('E-mail ou senha inválidos.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-container">

        <div className="login-brand-row">
          <div className="login-logo-wrapper">
            <img src="/logo-atly.png" alt="ATLY Performance Monitorada" />
          </div>
        </div>

        <div className="login-heading">
          <h2>Bem-vindo ao ATLY</h2>
          <p>Faça login para acessar o sistema de monitoramento</p>
        </div>

        <form onSubmit={fazerLogin} className="login-form-clean">
          <label>
            E-mail
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            <div className="password-label-row">
              <span>Senha</span>
              <button type="button">Esqueceu a senha?</button>
            </div>

            <div className="password-input-box">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          {erro && <div className="login-error-clean">{erro}</div>}

          <button
            type="submit"
            className="login-main-button"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
            {!carregando && <ArrowRight size={19} />}
          </button>
        </form>

        {/* LINK PARA IR PARA A TELA DE CADASTRO */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Não tem uma conta?{' '}
          <button 
            type="button" 
            onClick={onAlternarParaCadastro}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
          >
            Criar uma conta
          </button>
        </div>

      </section>
    </main>
  )
}

export default Login