import { useState } from 'react'

import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import HumanBody3D from './pages/HumanBody3D'
import DashboardTecnico from './pages/DashboardTecnico'
import Treino from './pages/Treino'
import Alertas from './pages/Alertas'
import Relatorios from './pages/Relatorios'
import DetalhesAtleta from './pages/DetalhesAtleta'
import CadastroAtleta from './pages/CadastroAtleta'

import './App.css'

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario')) || null
  )

  const [tela, setTela] = useState('dashboard')
  const [atletaSelecionado, setAtletaSelecionado] = useState(null)

  function handleLoginSuccess(usuarioData) {
    setUsuario(usuarioData)
    setTela('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    setTela('dashboard')
    setAtletaSelecionado(null)
  }

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app">
      <Sidebar
        usuario={usuario}
        tela={tela}
        setTela={setTela}
        onLogout={handleLogout}
      />

      <main className="conteudo">
        {tela === 'dashboard' && usuario.perfil === 'atleta' && (
          <Dashboard atletaId={usuario.id} />
        )}
        
        {tela === 'corpo3d' && <HumanBody3D atletaId={usuario.id} />}

        {tela === 'dashboard' && usuario.perfil === 'tecnico' && (
          <DashboardTecnico
            tecnicoId={usuario.id}
            setTela={setTela}
            setAtletaSelecionado={setAtletaSelecionado}
          />
        )}

        {tela === 'treino' && <Treino atletaId={usuario.id} />}

        {tela === 'alertas' && (
          <Alertas usuario={usuario} atletaSelecionado={atletaSelecionado} />
        )}

        {tela === 'relatorios' && (
          <Relatorios usuario={usuario} atletaSelecionado={atletaSelecionado} />
        )}

        {tela === 'detalhes-atleta' && (
          <DetalhesAtleta atleta={atletaSelecionado} />
        )}

        {tela === 'cadastro-atleta' && (
          <CadastroAtleta tecnicoId={usuario.id} />
        )}
      </main>
    </div>
  )
}



export default App