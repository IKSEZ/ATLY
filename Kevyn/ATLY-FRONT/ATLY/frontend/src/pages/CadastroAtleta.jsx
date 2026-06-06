import { useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'

function CadastroAtleta({ tecnicoId }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    modalidade: '',
    data_nascimento: ''
  })

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setLoading(true)

    try {
      await api.post('/atletas', {
        ...form,
        perfil: 'atleta',
        tecnico_id: tecnicoId
      })

      setMensagem('Atleta cadastrado com sucesso.')

      setForm({
        nome: '',
        email: '',
        senha: '',
        modalidade: '',
        data_nascimento: ''
      })
    } catch (error) {
      setErro('Erro ao cadastrar atleta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <Header
        titulo="Cadastrar Atleta"
        subtitulo="Adicione um novo atleta para acompanhamento técnico."
      />

      <form className="card form-card" onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <label>E-mail</label>
        <input
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Senha</label>
        <input
          name="senha"
          type="password"
          placeholder="Senha inicial"
          value={form.senha}
          onChange={handleChange}
          required
        />

        <label>Modalidade</label>
        <input
          name="modalidade"
          placeholder="Ex: futebol, corrida, musculação"
          value={form.modalidade}
          onChange={handleChange}
        />

        <label>Data de nascimento</label>
        <input
          name="data_nascimento"
          type="date"
          value={form.data_nascimento}
          onChange={handleChange}
        />

        {mensagem && <div className="success-message">{mensagem}</div>}
        {erro && <div className="error-message">{erro}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Atleta'}
        </button>
      </form>
    </section>
  )
}

export default CadastroAtleta