import api from './services/api'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tela, setTela] = useState('dashboard')

  return (
    <div className="app">
      <aside className="menu">
        <h2>ATLY</h2>

        <button onClick={() => setTela('dashboard')}>
          Dashboard
        </button>

        <button onClick={() => setTela('treino')}>
          Registrar Treino
        </button>
      </aside>

      <main className="conteudo">
        {tela === 'dashboard' && <Dashboard />}
        {tela === 'treino' && <RegistrarTreino />}
      </main>
    </div>
  )
}

function Dashboard() {
  const [analise, setAnalise] = useState(null)
  const [treinos, setTreinos] = useState([])

  async function buscarAnalise() {
    try {
      const token = localStorage.getItem('token')

      const resposta = await api.get('/treinos/atleta/1/analise', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setAnalise(resposta.data.analise)
    } catch (error) {
      console.error('Erro ao buscar análise:', error)
    }
  }

  async function buscarTreinos() {
    try {
      const token = localStorage.getItem('token')

      const resposta = await api.get('/treinos/atleta/1', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setTreinos(resposta.data.treinos)
    } catch (error) {
      console.error('Erro ao buscar treinos:', error)
    }
  }

  useEffect(() => {
    async function carregarDados() {
      await Promise.all([buscarAnalise(), buscarTreinos()])
    }

    void carregarDados()
  }, [])

  return (
    <section>
      <h1>Dashboard do Atleta</h1>

      <div className="cards">
        <div className="card">
          <h3>ACWR</h3>
          <p>{analise?.acwr || '--'}</p>
        </div>

        <div className="card">
          <h3>Nível de Risco</h3>
          <p>{analise?.nivel_risco || '--'}</p>
        </div>

        <div className="card">
          <h3>Carga Aguda</h3>
          <p>{analise?.carga_aguda || '--'}</p>
        </div>

        <div className="card">
          <h3>Carga Crônica</h3>
          <p>{analise?.carga_cronica || '--'}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Mensagem</h3>
        <p>{analise?.mensagem || 'Nenhuma análise encontrada'}</p>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Histórico de Treinos</h3>

        {treinos.length === 0 ? (
          <p>Nenhum treino encontrado</p>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Intensidade</th>
                <th>Duração</th>
                <th>Volume</th>
                <th>Carga</th>
              </tr>
            </thead>

            <tbody>
              {treinos.map((treino) => (
                <tr key={treino.id}>
                  <td>{treino.tipo || '-'}</td>
                  <td>{treino.intensidade}</td>
                  <td>{treino.duracao_min} min</td>
                  <td>{treino.volume || '-'}</td>
                  <td>{treino.carga}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function RegistrarTreino() {
  const [intensidade, setIntensidade] = useState('')
  const [duracao, setDuracao] = useState('')
  const [volume, setVolume] = useState('')
  const [tipo, setTipo] = useState('')

  async function salvarTreino(e) {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')

      const treino = {
        atleta_id: 1,
        intensidade: Number(intensidade),
        duracao_min: Number(duracao),
        volume: Number(volume),
        tipo
      }

      await api.post('/treinos', treino, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      alert('Treino registrado com sucesso!')

      setTipo('')
      setIntensidade('')
      setDuracao('')
      setVolume('')
    } catch (error) {
      console.error('Erro ao registrar treino:', error)
      alert('Erro ao registrar treino')
    }
  }

  return (
    <section>
      <h1>Registrar Treino</h1>

      <form onSubmit={salvarTreino} className="formulario">
        <label>
          Tipo do treino
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex: Corrida"
          />
        </label>

        <label>
          Intensidade
          <input
            type="number"
            value={intensidade}
            onChange={(e) => setIntensidade(e.target.value)}
            placeholder="Ex: 7"
          />
        </label>

        <label>
          Duração em minutos
          <input
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            placeholder="Ex: 60"
          />
        </label>

        <label>
          Volume
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="Ex: 1"
          />
        </label>

        <button type="submit">Salvar treino</button>
      </form>
    </section>
  )
}

export default App