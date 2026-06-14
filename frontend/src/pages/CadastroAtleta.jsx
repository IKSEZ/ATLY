import { useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'

function CadastroAtleta() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    idade: '',
    peso: '',
    modalidade: '',
    historico_lesoes: '',
  })

  const [mensagem, setMensagem] = useState('')
  const [senhaTemporaria, setSenhaTemporaria] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')
    setSenhaTemporaria('')
    setErro('')
    setLoading(true)

    try {
      const response = await api.post('/atletas', {
        ...form,
        idade: form.idade ? Number(form.idade) : null,
        peso: form.peso ? Number(form.peso) : null,
      })

      setMensagem('Atleta cadastrado e vinculado com sucesso.')
      setSenhaTemporaria(response.data?.senha_temporaria || '')

      setForm({
        nome: '',
        email: '',
        idade: '',
        peso: '',
        modalidade: '',
        historico_lesoes: '',
      })
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao cadastrar atleta.'
      setErro(msg)
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

        <label>Modalidade</label>
        <input
          name="modalidade"
          placeholder="Ex: Futebol, Natação, Corrida..."
          value={form.modalidade}
          onChange={handleChange}
        />

        <label>Idade</label>
        <input
          name="idade"
          type="number"
          min="0"
          placeholder="Ex: 24"
          value={form.idade}
          onChange={handleChange}
        />

        <label>Peso (kg)</label>
        <input
          name="peso"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 72.5"
          value={form.peso}
          onChange={handleChange}
        />

        <label>Histórico de lesões</label>
        <textarea
          name="historico_lesoes"
          placeholder="Descreva lesões anteriores, cirurgias ou observações clínicas"
          value={form.historico_lesoes}
          onChange={handleChange}
        />

        {mensagem && (
          <div className="success-message">{mensagem}</div>
        )}

        {senhaTemporaria && (
          <div className="success-message">
            Senha temporária:{' '}
            <strong>{senhaTemporaria}</strong>
            <br />
            <small>
              Informe esta senha ao atleta. Ele será solicitado a trocá-la
              no primeiro acesso.
            </small>
          </div>
        )}

        {erro && <div className="error-message">{erro}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Atleta'}
        </button>
      </form>
    </section>
  )
}

export default CadastroAtleta