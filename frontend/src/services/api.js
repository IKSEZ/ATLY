import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
})

// Interceptador para adicionar token automaticamente em todas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptador para lidar com erros 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api