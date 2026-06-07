import { useState } from 'react'
import api from '../services/api'
import {
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react'

function Login({ onLoginSuccess }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [perfil, setPerfil] = useState('atleta')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function fazerLogin(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      const resposta = await api.post('/auth/login', {
        email,
        senha
      })

      const { accessToken, token, usuario } = resposta.data
      const tokenAutenticacao = accessToken || token

      const usuarioFinal = {
        ...usuario,
        perfil: usuario.perfil
      }

      localStorage.setItem('token', tokenAutenticacao)
      localStorage.setItem('usuario', JSON.stringify(usuarioFinal))

      onLoginSuccess(usuarioFinal)
    } catch (error) {
      console.error('Erro no login:', error)
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  async function fazerCadastro(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      await api.post('/auth/cadastro', {
        nome,
        email,
        senha,
        perfil: perfil === 'treinador' ? 'tecnico' : 'atleta'
      })

      setSucesso('Cadastro realizado com sucesso. Agora faça login.')
      setModo('login')
      setSenha('')
      setNome('')
      setPerfil('atleta')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      setErro(error.response?.data?.erro || 'Erro ao realizar cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  function voltarParaLogin() {
    setModo('login')
    setErro('')
    setSucesso('')
    setSenha('')
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
          <h2>{modo === 'login' ? 'Bem-vindo ao ATLY' : 'Criar conta no ATLY'}</h2>
          <p>
            {modo === 'login'
              ? 'Faça login para acessar o sistema de monitoramento'
              : 'Cadastre-se como atleta ou treinador para acessar o sistema'}
          </p>
        </div>

        {modo === 'cadastro' && (
          <div className="login-type-grid">
            <button
              type="button"
              className={perfil === 'atleta' ? 'selected' : ''}
              onClick={() => setPerfil('atleta')}
            >
              Atleta
            </button>

            <button
              type="button"
              className={perfil === 'treinador' ? 'selected' : ''}
              onClick={() => setPerfil('treinador')}
            >
              Treinador
            </button>
          </div>
        )}

        <form onSubmit={modo === 'login' ? fazerLogin : fazerCadastro} className="login-form-clean">
          {modo === 'cadastro' && (
            <label>
              Nome completo
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>
          )}

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
              {modo === 'login' && <button type="button">Esqueceu a senha?</button>}
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
          {sucesso && <div className="login-success-clean">{sucesso}</div>}

          <button
            type="submit"
            className="login-main-button"
            disabled={carregando}
          >
            {carregando
              ? modo === 'login'
                ? 'Entrando...'
                : 'Cadastrando...'
              : modo === 'login'
                ? 'Entrar'
                : 'Cadastrar'}
            {!carregando && <ArrowRight size={19} />}
          </button>

          <div className="login-actions-row">
            {modo === 'login' ? (
              <button
                type="button"
                className="login-secondary-button"
                onClick={() => setModo('cadastro')}
              >
                Criar conta para atleta ou treinador
              </button>
            ) : (
              <button
                type="button"
                className="login-secondary-button"
                onClick={voltarParaLogin}
              >
                Já tenho conta
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login