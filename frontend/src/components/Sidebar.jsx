import {
  AlertTriangle,
  BarChart3,
  Dumbbell,
  Home,
  LogOut,
  Plus,
  UserRound,
  Users,
  Accessibility,
  Weight,
  Link2,
} from 'lucide-react'

function Sidebar({ usuario, tela, setTela, onLogout }) {
  const isTecnico = usuario?.perfil === 'tecnico'

  const menuAtleta = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'corpo3d', label: 'Corpo 3D', icon: Accessibility },
    { id: 'treino', label: 'Registrar Treino', icon: Dumbbell },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
  ]

  const menuTecnico = [
    { id: 'dashboard', label: 'Painel Técnico', icon: Users },
    { id: 'cadastro-atleta', label: 'Cadastrar Atleta', icon: Plus },
    { id: 'vincular-atleta', label: 'Vincular Atleta', icon: Link2 }, // 2. ITEM ADICIONADO AQUI
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
  ]

  const menu = isTecnico ? menuTecnico : menuAtleta

  return (
    <aside className="menu">
      <div className="brand">
         <div className="login-brand-row">
          <div className="login-logo-wrapper">
          <img src="/logo-atly.png" alt="ATLY Performance Monitorada" />
          </div>
        </div>
      </div>

      <div className="user-box">
        <UserRound size={18} />

        <div>
          <strong>{usuario?.nome || 'Usuário'}</strong>
          <span>{usuario?.perfil || 'perfil'}</span>
        </div>
      </div>

      <nav>
        {menu.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              className={tela === item.id ? 'active' : ''}
              onClick={() => setTela(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <button className="logout-button" onClick={onLogout}>
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  )
}

export default Sidebar