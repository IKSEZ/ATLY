import { useState } from 'react'
import api from '../services/api'
import {
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react'

function Cadastro({ onVoltarParaLogin, onCadastroSucesso }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function fazerCadastro(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      // Faz o disparo POST para a rota de cadastro de técnicos
      await api.post('/auth/cadastro', {
        nome,
        email,
        senha
      })

      setSucesso(true)
      
      // Aguarda 2 segundos exibindo mensagem de sucesso e retorna para o login
      setTimeout(() => {
        onCadastroSucesso()
      }, 2000)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro)
      } else {
        setErro('Erro ao realizar o cadastro. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-container">
        
        <button 
          type="button"
          onClick={onVoltarParaLogin}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '15px', padding: 0 }}
        >
          <ArrowLeft size={16} /> Voltar para o login
        </button>

        <div className="login-brand-row">
          <div className="login-logo-wrapper">
            <img src="/logo-atly.png" alt="ATLY Performance Monitorada" />
          </div>
        </div>

        <div className="login-heading">
          <h2>Cadastro de Técnico</h2>
          <p>Crie sua conta para gerenciar e monitorar seus atletas</p>
        </div>

        {sucesso ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#28a745', fontWeight: 'bold' }}>
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form onSubmit={fazerCadastro} className="login-form-clean">
            <label>
              Nome Completo
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>

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
              Senha
              <div className="password-input-box">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
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
              {carregando ? 'Criando conta...' : 'Cadastrar'}
              {!carregando && <ArrowRight size={19} />}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default Cadastro