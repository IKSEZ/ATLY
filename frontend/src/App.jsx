import { useState } from 'react'

import Sidebar from './components/Sidebar'

import Login from './pages/login'
import Cadastro from './pages/Cadastro' // 1. IMPORTAR A NOVA TELA DE CADASTRO DE TÉCNICOS
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Dashboard from './pages/Dashboard'
import HumanBody3D from './pages/HumanBody3d'
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
  
  // 2. NOVO ESTADO: Controla qual tela pública exibir quando deslogado
  const [telaPublica, setTelaPublica] = useState('login') 

  function handleLoginSuccess(usuarioData) {
    setUsuario(usuarioData)
    setTela('dashboard')
  }

  function handleSenhaTrocada() {
    const usuarioAtualizado = { ...usuario, senha_provisoria: false }
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado))
    setUsuario(usuarioAtualizado)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    setTela('dashboard')
    setAtletaSelecionado(null)
    setTelaPublica('login') // Garante que volta para o login ao deslogar
  }

  // 3. ALTERAÇÃO DO FLUXO PÚBLICO (DESLOGADO)
  if (!usuario) {
    if (telaPublica === 'cadastro') {
      return (
        <Cadastro 
          onVoltarParaLogin={() => setTelaPublica('login')} 
          onCadastroSucesso={() => setTelaPublica('login')} 
        />
      )
    }

    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onAlternarParaCadastro={() => setTelaPublica('cadastro')} 
      />
    )
  }

  // Atleta com senha temporária: bloqueia o app inteiro até trocar a senha
  if (usuario.senha_provisoria) {
    return <PrimeiroAcesso onSenhaTrocada={handleSenhaTrocada} />
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
          <DetalhesAtleta atletaId={atletaSelecionado} />
        )}

        {tela === 'cadastro-atleta' && (
          <CadastroAtleta tecnicoId={usuario.id} />
        )}
      </main>
    </div>
  )
}

export default App