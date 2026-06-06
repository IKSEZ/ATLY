import { useState, useEffect } from 'react'
import authService from './services/authService'
import treinoService from './services/treinoService'
import Login from './pages/login'
import './App.css'

const formatDecimal = (value, minimumFractionDigits, maximumFractionDigits) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--'
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(value))
}

function App() {
  const [usuario, setUsuario] = useState(() => authService.getUsuarioLogado())
  const [tela, setTela] = useState('dashboard')

  function handleLogout() {
    authService.logout()
    setUsuario(null)
  }

  function handleLoginSuccess(usuarioData) {
    setUsuario(usuarioData)
    setTela('dashboard')
  }

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app">
      <aside className="menu">
        <h2>ATLY</h2>
        <p style={{ fontSize: '12px', color: '#666' }}>Olá, {usuario.nome}</p>

        <button onClick={() => setTela('dashboard')}>Dashboard</button>
        <button onClick={() => setTela('treino')}>Registrar Treino</button>

        <button
          onClick={handleLogout}
          style={{ marginTop: '30px', backgroundColor: '#dc3545' }}
        >
          Logout
        </button>
      </aside>

      <main className="conteudo">
        {tela === 'dashboard' && <Dashboard atletaId={usuario.id} />}
        {tela === 'treino' && <RegistrarTreino atletaId={usuario.id} onTreinoRegistrado={() => setTela('dashboard')} />}
      </main>
    </div>
  )
}

function Dashboard({ atletaId }) {
  const [analise, setAnalise] = useState(null)
  const [treinos, setTreinos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscarDados() {
      setCarregando(true)
      try {
        const [treinosData, analiseData] = await Promise.all([
          treinoService.listarPorAtleta(atletaId),
          treinoService.analisarCarga(atletaId),
        ])

        setTreinos(treinosData.treinos || [])
        setAnalise(analiseData.analise)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    void buscarDados()
  }, [atletaId])

  if (carregando) {
    return <div style={{ padding: '20px' }}>Carregando...</div>
  }

  const riscoCor = {
    alto: '#dc3545',
    moderado: '#ffc107',
    baixo: '#28a745',
  }

  return (
    <section>
      <h1>Dashboard do Atleta</h1>

      <div className="cards">
        <div className="card">
          <h3>ACWR</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{analise?.acwr ?? '--'}</p>
        </div>

        <div className="card" style={{ backgroundColor: riscoCor[analise?.nivel_risco] + '20' }}>
          <h3>Nível de Risco</h3>
          <p style={{ fontSize: '24px', color: riscoCor[analise?.nivel_risco] }}>
            {analise?.nivel_risco?.toUpperCase() || '--'}
          </p>
        </div>

        <div className="card">
          <h3>Carga Aguda (7d)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analise?.carga_aguda_media ? Number(analise.carga_aguda_media).toFixed(1) : '--'}</p>
        </div>

        <div className="card">
          <h3>Carga Crônica (28d)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analise?.carga_cronica_media ? Number(analise.carga_cronica_media).toFixed(1) : '--'}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Análise</h3>
        <p>{analise?.mensagem || 'Sem análise disponível'}</p>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Histórico de Treinos (Últimos 50)</h3>

        {treinos.length === 0 ? (
          <p>Nenhum treino registrado</p>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Intensidade</th>
                <th>Duração (min)</th>
                <th>Volume</th>
                <th>Carga</th>
              </tr>
            </thead>
            <tbody>
              {treinos.map((treino) => (
                <tr key={treino.id}>
                  <td>{new Date(treino.data_treino).toLocaleDateString('pt-BR')}</td>
                  <td>{treino.tipo || '-'}</td>
                  <td>{Number.isInteger(Number(treino.intensidade)) ? Number(treino.intensidade) : formatDecimal(treino.intensidade, 0, 1)}</td>
                  <td>{treino.duracao_min}</td>
                  <td>{formatDecimal(treino.volume, 2, 2)}</td>
                  <td>{formatDecimal(treino.carga, 1, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function RegistrarTreino({ atletaId, onTreinoRegistrado }) {
  const [tipo, setTipo] = useState('')
  const [intensidade, setIntensidade] = useState('')
  const [duracao, setDuracao] = useState('')
  const [volume, setVolume] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem('')

    try {
      const intensidadeNumero = parseInt(intensidade, 10)
      const duracaoNumero = parseInt(duracao, 10)
      const volumeNumero = volume === '' ? null : parseFloat(volume)

      await treinoService.registrar(
        atletaId,
        intensidadeNumero,
        duracaoNumero,
        volumeNumero,
        tipo
      )

      setMensagem('✓ Treino registrado com sucesso!')
      setTipo('')
      setIntensidade('')
      setDuracao('')
      setVolume('')

      // Voltar ao dashboard após 2 segundos
      setTimeout(() => {
        onTreinoRegistrado()
      }, 2000)
    } catch (error) {
      setMensagem(`✗ Erro: ${error.response?.data?.erro || error.message}`)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section>
      <h1>Registrar Treino</h1>

      <form onSubmit={handleSubmit} className="formulario" style={{ maxWidth: '500px' }}>
        <label>
          Tipo do Treino:
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex: Corrida, Musculação, Ciclismo"
            required
          />
        </label>

        <label>
          Intensidade (1-10):
          <input
            type="number"
            min="1"
            max="10"
            step="1"
            value={intensidade}
            onChange={(e) => setIntensidade(e.target.value)}
            placeholder="Ex: 7"
            required
          />
        </label>

        <label>
          Duração (min):
          <input
            type="number"
            min="1"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            placeholder="Ex: 60"
            required
          />
        </label>

        <label>
          Volume (km ou repetições):
          <input
            type="number"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="Ex: 10"
          />
        </label>

        <button type="submit" disabled={carregando} style={{ marginTop: '20px' }}>
          {carregando ? 'Salvando...' : 'Registrar Treino'}
        </button>
      </form>

      {mensagem && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: mensagem.includes('✓') ? '#d4edda' : '#f8d7da',
            color: mensagem.includes('✓') ? '#155724' : '#721c24',
            borderRadius: '4px',
          }}
        >
          {mensagem}
        </div>
      )}
    </section>
  )
}

export default App
