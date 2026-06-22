import { useState, useEffect } from 'react' // CORREÇÃO: useEffect importado aqui

import Sidebar from './components/Sidebar'

import Login from './pages/login'
import Cadastro from './pages/Cadastro' 
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Dashboard from './pages/Dashboard'
import HumanBody3D from './pages/HumanBody3d'
import DashboardTecnico from './pages/DashboardTecnico'
import Treino from './pages/Treino'
import Alertas from './pages/Alertas'
import Relatorios from './pages/Relatorios'
import DetalhesAtleta from './pages/DetalhesAtleta'
import CadastroAtleta from './pages/CadastroAtleta'
import VincularAtleta from './pages/VincularAtleta' 

import './App.css'

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario')) || null
  )

  const [tela, setTela] = useState('dashboard')
  const [atletaSelecionado, setAtletaSelecionado] = useState(null)
  const [telaPublica, setTelaPublica] = useState('login') 

  // CORREÇÃO: Removido o 'require' e usado o useEffect nativo do Vite
  useEffect(() => {
    try {
      console.log("--- RASTREAMENTO DE ESTADO DO APP ---");
      console.log(`Tela ativa no sistema: "${tela}"`);
      console.log(`Valor atual do atletaSelecionado no App.jsx:`, atletaSelecionado);
      
      if (tela === 'detalhes-atleta' && (atletaSelecionado === null || atletaSelecionado === undefined)) {
        console.error("ALERTA: O sistema mudou para a tela 'detalhes-atleta', mas o ID do atleta está VAZIO.");
      }
      console.log("-------------------------------------");
    } catch (err) {
      console.error("Erro interno no monitor de log do App.jsx:", err);
    }
  }, [tela, atletaSelecionado]);

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
    setTelaPublica('login') 
  }

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

        {/* Mantido o mapeamento blindado das propriedades */}
        {tela === 'detalhes-atleta' && (
          <DetalhesAtleta 
            atletaId={atletaSelecionado} 
            atletaID={atletaSelecionado} 
            atletaSelecionado={atletaSelecionado}
          />
        )}

        {tela === 'cadastro-atleta' && (
          <CadastroAtleta tecnicoId={usuario.id} />
        )}

        {tela === 'vincular-atleta' && (
          <VincularAtleta tecnicoId={usuario.id} />
        )}
      </main>
    </div>
  )
}

export default App