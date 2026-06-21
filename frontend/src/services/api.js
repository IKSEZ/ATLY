import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  timeout: 3000
})

api.interceptors.request.use((config) => {
  // Injeta apenas o Token de Autorização, que o backend já aceita perfeitamente
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

export default api