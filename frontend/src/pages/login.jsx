import { useState } from 'react'
import authService from '../services/authService'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modo, setModo] = useState('login') // 'login' ou 'cadastro'
  const [nome, setNome] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const resultado = await authService.login(email, senha)
      if (onLoginSuccess) {
        onLoginSuccess(resultado.usuario)
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      await authService.cadastro(nome, email, senha)
      setErro('')
      setModo('login')
      setEmail('')
      setSenha('')
      setNome('')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>{modo === 'login' ? 'Login' : 'Cadastro'}</h1>

      {erro && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {erro}
        </div>
      )}

      <form onSubmit={modo === 'login' ? handleLogin : handleCadastro}>
        {modo === 'cadastro' && (
          <div style={{ marginBottom: '10px' }}>
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: carregando ? 'not-allowed' : 'pointer',
          }}
        >
          {carregando ? 'Carregando...' : modo === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {modo === 'login' ? (
          <>
            Não tem conta?{' '}
            <a href="#" onClick={() => setModo('cadastro')}>
              Cadastre-se
            </a>
          </>
        ) : (
          <>
            Já tem conta?{' '}
            <a href="#" onClick={() => setModo('login')}>
              Faça login
            </a>
          </>
        )}
      </p>
    </div>
  )
}