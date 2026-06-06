import { useState } from 'react'
import api from '../services/api'
import {
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Users
} from 'lucide-react'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState('atleta')
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

      const { token, usuario } = resposta.data

      const usuarioFinal = {
        ...usuario,
        perfil: usuario.perfil || tipoUsuario
      }

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuarioFinal))

      onLoginSuccess(usuarioFinal)
    } catch (error) {
      console.error('Erro no login:', error)
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  function acessoDemo(tipo) {
    const usuarioDemo = {
      id: tipo === 'tecnico' ? 2 : 1,
      nome: tipo === 'tecnico' ? 'Técnico ATLY' : 'Atleta ATLY',
      perfil: tipo
    }

    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('usuario', JSON.stringify(usuarioDemo))

    onLoginSuccess(usuarioDemo)
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

        <div className="login-type-grid">
          <button
            type="button"
            className={tipoUsuario === 'atleta' ? 'selected' : ''}
            onClick={() => setTipoUsuario('atleta')}
          >
            <User size={20} />
            Atleta
          </button>

          <button
            type="button"
            className={tipoUsuario === 'tecnico' ? 'selected' : ''}
            onClick={() => setTipoUsuario('tecnico')}
          >
            <Users size={20} />
            Técnico
          </button>
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

        <div className="login-divider-clean">
          <span>Acesso rápido para demonstração</span>
        </div>

        <div className="login-demo-buttons">
          <button type="button" onClick={() => acessoDemo('atleta')}>
            <User size={18} />
            Demo Atleta
          </button>

          <button type="button" onClick={() => acessoDemo('tecnico')}>
            <Users size={18} />
            Demo Técnico
          </button>
        </div>

      </section>
    </main>
  )
}

export default Login