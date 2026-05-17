import api from './api'

const authService = {
  // Login
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha })
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken)
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
    }
    return response.data
  },

  // Cadastro
  async cadastro(nome, email, senha, perfil = 'atleta') {
    const response = await api.post('/auth/cadastro', {
      nome,
      email,
      senha,
      perfil,
    })
    return response.data
  },

  // Logout
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },

  // Obter usuário logado
  getUsuarioLogado() {
    const usuario = localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  },

  // Verificar se está autenticado
  estaAutenticado() {
    return !!localStorage.getItem('token')
  },
}

export default authService
